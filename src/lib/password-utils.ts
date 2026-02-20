/**
 * Returns a cryptographically secure random integer in [0, max).
 */
function secureRandomInt(max: number): number {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0] % max;
}

/**
 * Generates a random secure password with 12 characters.
 * Includes at least one lowercase, one uppercase, one digit, and one special character.
 */
export function generatePassword(): string {
    const lowercase = "abcdefghijklmnopqrstuvwxyz"
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    const numbers = "0123456789"
    const special = "!@#$%^&*"
    const allChars = lowercase + uppercase + numbers + special

    const chars: string[] = [
        lowercase.charAt(secureRandomInt(lowercase.length)),
        uppercase.charAt(secureRandomInt(uppercase.length)),
        numbers.charAt(secureRandomInt(numbers.length)),
        special.charAt(secureRandomInt(special.length)),
    ]

    for (let i = 4; i < 12; i++) {
        chars.push(allChars.charAt(secureRandomInt(allChars.length)))
    }

    // Fisher-Yates shuffle using crypto
    for (let i = chars.length - 1; i > 0; i--) {
        const j = secureRandomInt(i + 1);
        [chars[i], chars[j]] = [chars[j], chars[i]];
    }

    return chars.join('')
}
