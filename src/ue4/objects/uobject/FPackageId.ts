import { FName } from "./FName";
import CityHash from "farmhash"
import { FArchive } from "../../reader/FArchive";

export const INVALID_ID = 0
export class FPackageId {
    static fromName(name: FName) {
        const nameStr = name.toString().toLowerCase()
        const nameBuf = Buffer.from(nameStr, "utf16le")
        const hash = parseInt(CityHash.hash64(nameBuf))
        if (hash === INVALID_ID)
            throw new Error(`Package name hash collision \"${nameStr}\" and InvalidId`)
        return new FPackageId(hash)
    }

    private id = INVALID_ID

    constructor()
    constructor(id: number)
    constructor(Ar: FArchive)
    constructor(x?: any) {
        if (x instanceof FArchive) {
            this.id = x.readUInt64() as unknown as number
        } else {
            this.id = x
        }
    }

    isValid() {
        return this.id !== INVALID_ID
    }

    value() {
        if (this.id === INVALID_ID)
            throw new Error("Field 'id' must not be zero")
        return this.id
    }

    valueForDebugging() {
        return this.id
    }

    equals(other: any) {
        if (this === other) return true
        if (!(other instanceof FPackageId)) return false
        other as FPackageId
        return Number(this.id) === Number(other.id)
    }

    hashCode() {
        return this.id
    }

    toString() {
        return this.id
    }
}