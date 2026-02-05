import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Autocomplete, AutocompleteItem, ScrollShadow, Select, SelectItem } from "@heroui/react"
import { useEffect, useState, useMemo } from "react"
import { addToast } from "@heroui/toast"
import { useDebounce } from "@/hooks/useDebounce"
import { Search, MapPin, Plus, X, ChevronRight, Check, Trash2 } from "lucide-react"
import { getLocationsSelect, createLocation, Location } from "@/services/masters/locations.service"
import { getCommunesSelect, Commune } from "@/services/masters/communes.service"
import { getVariableLocations, associateVariableLocation, disassociateVariableLocation } from "@/services/masters/variables.service"
import { z } from "zod"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

interface VariableLocationModalProps {
    isOpen: boolean
    onClose: () => void
    variableId: string | null
    variableCode?: string
}

const ROAD_TYPES = [
    { key: "calle", label: "Calle" },
    { key: "carrera", label: "Carrera" },
    { key: "autopista", label: "Autopista" },
    { key: "avenida", label: "Avenida" },
    { key: "diagonal", label: "Diagonal" },
    { key: "transversal", label: "Transversal" },
    { key: "circular", label: "Circular" },
    { key: "manzana", label: "Manzana" },
    { key: "vereda", label: "Vereda" },
    { key: "kilometro", label: "Kilómetro" },
]

const createLocationSchema = z.object({
    address: z.string().optional(),
    communeId: z.string().min(1, "La comuna es requerida"),
    latitude: z.string().optional(),
    longitude: z.string().optional(),
})

type CreateLocationFormValues = z.infer<typeof createLocationSchema>

export function VariableLocationModal({ isOpen, onClose, variableId, variableCode }: VariableLocationModalProps) {
    const [mode, setMode] = useState<"search" | "create">("search")
    const [createMode, setCreateMode] = useState<"builder" | "custom">("builder")

    // Address builder state
    const [roadType, setRoadType] = useState("")
    const [roadNumber, setRoadNumber] = useState("")
    const [crossNumber, setCrossNumber] = useState("")
    const [houseNumber, setHouseNumber] = useState("")
    const [additionalInfo, setAdditionalInfo] = useState("")

    // Search State
    const [searchValue, setSearchValue] = useState("")
    const debouncedSearch = useDebounce(searchValue, 500)
    const [locations, setLocations] = useState<Location[]>([])
    const [loadingLocations, setLoadingLocations] = useState(false)

    // Associated Locations State
    const [associatedLocations, setAssociatedLocations] = useState<any[]>([])
    const [loadingAssociated, setLoadingAssociated] = useState(false)
    const [associatedFilter, setAssociatedFilter] = useState("")
    const [deletingLocationId, setDeletingLocationId] = useState<string | null>(null)

    // Create State
    const [communes, setCommunes] = useState<Commune[]>([])
    const [loadingCommunes, setLoadingCommunes] = useState(false)

    const { control, handleSubmit, formState: { errors, isSubmitting: isCreating }, reset, setValue, watch } = useForm<CreateLocationFormValues>({
        resolver: zodResolver(createLocationSchema),
        defaultValues: {
            address: "",
            communeId: "",
            latitude: "",
            longitude: "",
        }
    })

    const addressValue = watch("address")

    // Build address from builder fields
    useEffect(() => {
        if (createMode === "builder") {
            const roadLabel = ROAD_TYPES.find(r => r.key === roadType)?.label || ""
            let address = ""
            if (roadLabel && roadNumber) {
                address = `${roadLabel} ${roadNumber}`
                if (crossNumber) {
                    address += ` # ${crossNumber}`
                    if (houseNumber) {
                        address += ` - ${houseNumber}`
                    }
                }
                if (additionalInfo) {
                    address += `, ${additionalInfo}`
                }
            }
            setValue("address", address)
        }
    }, [roadType, roadNumber, crossNumber, houseNumber, additionalInfo, createMode, setValue])

    const fetchAssociatedLocations = async () => {
        if (!variableId) return
        setLoadingAssociated(true)
        try {
            const data = await getVariableLocations(variableId)
            console.log("Associated locations data:", data)
            setAssociatedLocations(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error("Error fetching associated locations:", error)
        } finally {
            setLoadingAssociated(false)
        }
    }

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setMode("search")
            setCreateMode("builder")
            setSearchValue("")
            setLocations([])
            setAssociatedFilter("")
            setRoadType("")
            setRoadNumber("")
            setCrossNumber("")
            setHouseNumber("")
            setAdditionalInfo("")
            reset()
            fetchAssociatedLocations()
        }
    }, [isOpen, reset, variableId])

    // Fetch locations when search changes
    useEffect(() => {
        if (mode === "search" && debouncedSearch.length >= 3) {
            setLoadingLocations(true)
            const params = new URLSearchParams({
                search: debouncedSearch,
                limit: "20",
                offset: "0"
            })
            getLocationsSelect(params.toString())
                .then(res => setLocations(res.data))
                .catch(err => console.error(err))
                .finally(() => setLoadingLocations(false))
        } else {
            setLocations([])
        }
    }, [debouncedSearch, mode])

    // Fetch communes when switching to create mode
    useEffect(() => {
        if (mode === "create" && communes.length === 0) {
            setLoadingCommunes(true)
            getCommunesSelect("limit=100")
                .then(res => setCommunes(res.data))
                .catch(err => addToast({ title: "Error al cargar comunas", color: "danger" }))
                .finally(() => setLoadingCommunes(false))
        }
    }, [mode, communes.length])

    const handleAssociate = async (locationId: string) => {
        if (!variableId) return

        try {
            await associateVariableLocation(variableId, locationId)
            addToast({ title: "Ubicación asociada correctamente", color: "success" })
            fetchAssociatedLocations()
            setSearchValue("")
            setLocations([])
        } catch (error: any) {
            addToast({ title: error.message || "Error al asociar ubicación", color: "danger" })
        }
    }

    const handleDisassociate = async (locationId: string) => {
        if (!variableId) return

        setDeletingLocationId(locationId)
        try {
            await disassociateVariableLocation(variableId, locationId)
            addToast({ title: "Ubicación eliminada correctamente", color: "success" })
            fetchAssociatedLocations()
        } catch (error: any) {
            addToast({ title: error.message || "Error al eliminar ubicación", color: "danger" })
        } finally {
            setDeletingLocationId(null)
        }
    }

    const handleCreateSubmit = async (data: CreateLocationFormValues) => {
        if (!variableId) return

        try {
            // 1. Create Location
            const newLocation = await createLocation({
                address: data.address || "",
                communeId: data.communeId,
                latitude: data.latitude ? Number(data.latitude) : undefined,
                longitude: data.longitude ? Number(data.longitude) : undefined,
            })

            // 2. Associate
            await handleAssociate(newLocation.id)
            setMode("search")
        } catch (error: any) {
            addToast({ title: error.message || "Error al crear ubicación", color: "danger" })
        }
    }

    // Filter associated locations
    const filteredAssociatedLocations = useMemo(() => {
        if (!associatedFilter) return associatedLocations
        const lowerFilter = associatedFilter.toLowerCase()
        return associatedLocations.filter((item: any) =>
            item.location?.address.toLowerCase().includes(lowerFilter) ||
            item.location?.commune?.name.toLowerCase().includes(lowerFilter)
        )
    }, [associatedLocations, associatedFilter])

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside" classNames={{
            base: "bg-white dark:bg-zinc-900",
            header: "border-b border-default-100",
            footer: "border-t border-default-100",
            closeButton: "hover:bg-default-100 active:bg-default-200"
        }}>
            <ModalContent>
                {(close) => (
                    <>
                        <ModalHeader className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-default-100">
                                    <MapPin size={18} className="text-default-600" />
                                </div>
                                <div>
                                    <h2 className="text-base font-semibold text-default-900">
                                        {mode === "search" ? "Ubicaciones" : "Nueva ubicación"}
                                        {variableCode && <span className="ml-2 text-primary">({variableCode})</span>}
                                    </h2>
                                    <p className="text-xs text-default-400 font-normal">
                                        {mode === "search" ? "Gestiona las ubicaciones asociadas a la variable" : "Completa los datos de la ubicación"}
                                    </p>
                                </div>
                            </div>
                        </ModalHeader>
                        <ModalBody className="p-0">
                            {mode === "search" ? (
                                <div className="flex flex-col">
                                    {/* Search Input */}
                                    <div className="px-6 py-4 border-b border-default-100">
                                        <div className="relative">
                                            <Input
                                                startContent={<Search className="text-default-400" size={18} />}
                                                placeholder="Buscar ubicación..."
                                                value={searchValue}
                                                onValueChange={setSearchValue}
                                                variant="flat"
                                                classNames={{
                                                    inputWrapper: "bg-default-100 hover:bg-default-200/70 transition-colors",
                                                    input: "text-sm"
                                                }}
                                                endContent={
                                                    searchValue && (
                                                        <button onClick={() => setSearchValue("")} className="p-0.5 hover:bg-default-300 rounded-full transition-colors">
                                                            <X size={14} className="text-default-500" />
                                                        </button>
                                                    )
                                                }
                                            />

                                            {/* Search Results */}
                                            {(searchValue.length >= 3 || locations.length > 0) && (
                                                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-800 rounded-xl border border-default-200 max-h-64 overflow-y-auto z-50">
                                                    {loadingLocations && (
                                                        <div className="flex items-center justify-center py-8 gap-2 text-default-400">
                                                            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                                            <span className="text-sm">Buscando...</span>
                                                        </div>
                                                    )}

                                                    {!loadingLocations && locations.length === 0 && searchValue.length >= 3 && (
                                                        <div className="py-8 px-4 text-center">
                                                            <p className="text-sm text-default-500 mb-3">No se encontraron resultados</p>
                                                            <Button
                                                                size="sm"
                                                                variant="flat"
                                                                onPress={() => setMode("create")}
                                                                startContent={<Plus size={14} />}
                                                            >
                                                                Crear nueva ubicación
                                                            </Button>
                                                        </div>
                                                    )}

                                                    {!loadingLocations && locations.map((loc) => {
                                                        const isAssociated = associatedLocations.some((al: any) => al.locationId === loc.id)
                                                        return (
                                                            <button
                                                                key={loc.id}
                                                                onClick={() => !isAssociated && handleAssociate(loc.id)}
                                                                disabled={isAssociated}
                                                                className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-default-50 transition-colors border-b border-default-100 last:border-0 ${isAssociated ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                            >
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium text-default-700 truncate">{loc.address}</p>
                                                                    <p className="text-xs text-default-400">{loc.commune?.name}</p>
                                                                </div>
                                                                {isAssociated ? (
                                                                    <Check size={16} className="text-success flex-shrink-0 ml-2" />
                                                                ) : (
                                                                    <Plus size={16} className="text-default-400 flex-shrink-0 ml-2" />
                                                                )}
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Associated Locations */}
                                    <div className="px-6 py-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-default-700">Asociadas</span>
                                                <span className="text-xs text-default-400 bg-default-100 px-2 py-0.5 rounded-full">
                                                    {associatedLocations.length}
                                                </span>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="light"
                                                onPress={() => setMode("create")}
                                                startContent={<Plus size={14} />}
                                                className="text-primary"
                                            >
                                                Crear nueva
                                            </Button>
                                        </div>

                                        <div className="mb-3">
                                            <Input
                                                size="sm"
                                                variant="flat"
                                                placeholder="Filtrar..."
                                                value={associatedFilter}
                                                onValueChange={setAssociatedFilter}
                                                classNames={{
                                                    inputWrapper: "bg-default-50 h-9",
                                                    input: "text-sm"
                                                }}
                                                startContent={<Search size={14} className="text-default-400" />}
                                            />
                                        </div>

                                        <ScrollShadow className="max-h-[280px]">
                                            {loadingAssociated && (
                                                <div className="py-8 text-center text-default-400 text-sm">Cargando...</div>
                                            )}

                                            {!loadingAssociated && associatedLocations.length === 0 && (
                                                <div className="py-12 text-center">
                                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-default-100 mb-3">
                                                        <MapPin size={20} className="text-default-400" />
                                                    </div>
                                                    <p className="text-sm text-default-500">Sin ubicaciones asociadas</p>
                                                </div>
                                            )}

                                            {!loadingAssociated && filteredAssociatedLocations.length === 0 && associatedLocations.length > 0 && (
                                                <div className="py-8 text-center text-default-400 text-sm">
                                                    Sin resultados para el filtro
                                                </div>
                                            )}

                                            <div className="space-y-2">
                                                {!loadingAssociated && filteredAssociatedLocations.map((item: any) => (
                                                    <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg bg-default-50 border border-default-200 hover:border-primary-300 hover:bg-primary-50/30 transition-colors">
                                                        <div className="p-1.5 rounded-md bg-primary-100 text-primary-600">
                                                            <MapPin size={14} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-default-800 leading-tight">
                                                                {item.location?.address || "Sin dirección"}
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-xs text-default-600 font-medium">
                                                                    {item.location?.commune?.name}
                                                                </span>
                                                                {(item.location?.latitude && item.location?.longitude) && (
                                                                    <>
                                                                        <span className="w-1 h-1 rounded-full bg-default-400" />
                                                                        <span className="text-xs text-default-500 font-mono">
                                                                            {item.location?.latitude}, {item.location?.longitude}
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <Button
                                                            isIconOnly
                                                            size="sm"
                                                            variant="light"
                                                            color="danger"
                                                            isLoading={deletingLocationId === item.locationId}
                                                            onPress={() => handleDisassociate(item.locationId)}
                                                            className="flex-shrink-0"
                                                        >
                                                            <Trash2 size={14} />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollShadow>
                                    </div>
                                </div>
                            ) : (
                                <div className="px-6 py-5">
                                    <form id="create-location-form" onSubmit={handleSubmit(handleCreateSubmit)} className="space-y-5">
                                        {/* Comuna */}
                                        <Controller
                                            name="communeId"
                                            control={control}
                                            render={({ field }) => (
                                                <Autocomplete
                                                    label="Comuna"
                                                    placeholder="Seleccione una comuna"
                                                    defaultItems={communes}
                                                    isLoading={loadingCommunes}
                                                    selectedKey={field.value}
                                                    onSelectionChange={(key) => field.onChange(key as string)}
                                                    isInvalid={!!errors.communeId}
                                                    errorMessage={errors.communeId?.message}
                                                    variant="bordered"
                                                >
                                                    {(item) => <AutocompleteItem key={item.id}>{item.name}</AutocompleteItem>}
                                                </Autocomplete>
                                            )}
                                        />

                                        {/* Address Section */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="text-sm text-default-600">Dirección</label>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (createMode === "builder") {
                                                            setCreateMode("custom")
                                                        } else {
                                                            setCreateMode("builder")
                                                            setRoadType("")
                                                            setRoadNumber("")
                                                            setCrossNumber("")
                                                            setHouseNumber("")
                                                            setAdditionalInfo("")
                                                        }
                                                    }}
                                                    className="text-xs text-primary hover:underline"
                                                >
                                                    {createMode === "builder" ? "Escribir manualmente" : "Usar constructor"}
                                                </button>
                                            </div>

                                            {createMode === "builder" ? (
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-12 gap-3">
                                                        <div className="col-span-5">
                                                            <Select
                                                                label="Tipo de vía"
                                                                placeholder="Seleccione..."
                                                                selectedKeys={roadType ? [roadType] : []}
                                                                onSelectionChange={(keys) => setRoadType(Array.from(keys)[0] as string)}
                                                                variant="bordered"
                                                            >
                                                                {ROAD_TYPES.map((road) => (
                                                                    <SelectItem key={road.key}>{road.label}</SelectItem>
                                                                ))}
                                                            </Select>
                                                        </div>
                                                        <div className="col-span-7">
                                                            <Input
                                                                label="Número de vía"
                                                                placeholder="Ej. 10, 100A"
                                                                value={roadNumber}
                                                                onValueChange={setRoadNumber}
                                                                variant="bordered"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-12 gap-3">
                                                        <div className="col-span-6">
                                                            <Input
                                                                label="Número cruce (#)"
                                                                placeholder="Ej. 20"
                                                                value={crossNumber}
                                                                onValueChange={setCrossNumber}
                                                                variant="bordered"
                                                                startContent={<span className="text-default-400 text-sm">#</span>}
                                                            />
                                                        </div>
                                                        <div className="col-span-6">
                                                            <Input
                                                                label="Número casa (-)"
                                                                placeholder="Ej. 30"
                                                                value={houseNumber}
                                                                onValueChange={setHouseNumber}
                                                                variant="bordered"
                                                                startContent={<span className="text-default-400 text-sm">-</span>}
                                                            />
                                                        </div>
                                                    </div>
                                                    <Input
                                                        label="Información adicional"
                                                        placeholder="Ej. Piso 2, Oficina 301, Barrio Centro"
                                                        value={additionalInfo}
                                                        onValueChange={setAdditionalInfo}
                                                        variant="bordered"
                                                    />

                                                    {addressValue && (
                                                        <div className="flex items-center gap-2 px-3 py-2 bg-default-50 rounded-lg">
                                                            <ChevronRight size={14} className="text-default-400" />
                                                            <span className="text-sm text-default-600">{addressValue}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <Controller
                                                    name="address"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Input
                                                            {...field}
                                                            label="Dirección personalizada"
                                                            placeholder="Escriba la dirección completa"
                                                            isInvalid={!!errors.address}
                                                            errorMessage={errors.address?.message}
                                                            variant="bordered"
                                                        />
                                                    )}
                                                />
                                            )}
                                        </div>

                                        {/* Coordinates */}
                                        <div>
                                            <label className="text-sm text-default-600 mb-2 block">Coordenadas (opcional)</label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <Controller
                                                    name="latitude"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Input
                                                            {...field}
                                                            label="Latitud"
                                                            placeholder="Ej. 4.6097"
                                                            variant="bordered"
                                                        />
                                                    )}
                                                />
                                                <Controller
                                                    name="longitude"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Input
                                                            {...field}
                                                            label="Longitud"
                                                            placeholder="Ej. -74.0817"
                                                            variant="bordered"
                                                        />
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </ModalBody>
                        <ModalFooter className="px-6 py-4">
                            {mode === "create" ? (
                                <div className="flex gap-2 w-full justify-end">
                                    <Button variant="flat" onPress={() => setMode("search")} size="sm">
                                        Cancelar
                                    </Button>
                                    <Button color="primary" type="submit" form="create-location-form" isLoading={isCreating} size="sm">
                                        Guardar
                                    </Button>
                                </div>
                            ) : (
                                <Button variant="flat" onPress={close} size="sm">
                                    Cerrar
                                </Button>
                            )}
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}
