import { FArchive } from "../../reader/FArchive";
import { FName } from "../../objects/uobject/FName";
import { FGuid } from "../../objects/core/misc/Guid";
import { FMD5Hash } from "./FMD5Hash";

export class FAssetPackageData {
    packageName: FName
    diskSize: number
    packageGuid: FGuid
    cookedHash?: FMD5Hash

    constructor(Ar: FArchive, serializeHash: boolean) {
        this.packageName = Ar.readFName()
        this.diskSize = Ar.readInt64() as unknown as number
        this.packageGuid = new FGuid(Ar)
        this.cookedHash = serializeHash ? new FMD5Hash(Ar) : null
    }
}