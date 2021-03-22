import { FArchive } from "../reader/FArchive";

/**
 * Container ID.
 */
export class FIoContainerId {
    static InvalidId = 0xFFFFFFFFFFFFFFFFn

    id = FIoContainerId.InvalidId

    constructor(Ar: FArchive) {
        this.id = BigInt(Ar.readUInt64())
    }

    value() {
        return this.id
    }

    isValid() {
        return this.id !== FIoContainerId.InvalidId
    }
}