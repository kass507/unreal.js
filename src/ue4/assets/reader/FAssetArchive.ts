import { FByteArchive } from "../../reader/FByteArchive";
import { FileProvider } from "../../../fileprovider/FileProvider";
import Collection from "@discordjs/collection";
import { PayloadType } from "../util/PayloadType";
import { ParserException } from "../../../exceptions/Exceptions";
import { PakPackage } from "../PakPackage";
import { FName } from "../../objects/uobject/FName";

export class FAssetArchive extends FByteArchive {
    data: Buffer
    provider?: FileProvider
    pkgName: string

    constructor(data: Buffer, provider: FileProvider = null, pkgName: string) {
        super(data)
        this.data = data
        this.provider = provider
        this.pkgName = pkgName
    }

    owner: any
    protected payloads: Collection<PayloadType, FAssetArchive> = new Collection<PayloadType, FAssetArchive>()
    uassetSize = 0
    uexpSize = 0
    bulkDataStartOffset = 0

    getPayload(type: PayloadType) {
        const p = this.payloads.get(type)
        return p ? p : new FByteArchive(Buffer.alloc(0))
    }

    addPayload(type: PayloadType, payload: FAssetArchive) {
        if (this.payloads.has(type))
            throw ParserException(`Can't add a payload that is already attached of type ${type}`)
        return this.payloads.set(type, payload)
    }

    clone(): FAssetArchive {
        const c = new FAssetArchive(this.data, this.provider, this.pkgName)
        c.game = this.game
        c.ver = this.ver
        c.useUnversionedPropertySerialization = this.useUnversionedPropertySerialization
        c.isFilterEditorOnly = this.isFilterEditorOnly
        c.littleEndianAccessor = this.littleEndianAccessor
        c.pos(this.pos())
        c.owner = this.owner
        this.payloads.forEach((v, k) => c.addPayload(k, v))
        c.uassetSize = this.uassetSize
        c.uexpSize = this.uexpSize
        c.bulkDataStartOffset = this.bulkDataStartOffset
        return c
    }

    seekRelative(pos: number) {
        this.seek(pos - this.uassetSize - this.uexpSize)
    }

    relativePos() {
        return this.uassetSize + this.uexpSize + this.pos()
    }

    toRelativePos(normalPos: number) {
        return normalPos + this.uassetSize + this.uexpSize
    }

    handleBadNameIndex(nameIndex: number) {
        throw ParserException(`FName could not be read, requested index ${nameIndex}, name map size ${(this.owner as PakPackage).nameMap.length}`)
    }

    readFName(): FName {
        const owner = this.owner as PakPackage
        const nameIndex = this.readInt32()
        const extraIndex = this.readInt32()
        if (nameIndex in owner.nameMap) {
            return new FName(owner.nameMap, nameIndex, extraIndex)
        }
        this.handleBadNameIndex(nameIndex)
        return new FName()
    }

    printError() {
        return console.log(`FAssetArchive Info: pos ${this.pos()}, stopper ${this.size()}, package ${this.pkgName}`)
    }

    readObject<T>() {
        //const ind = new FPa
    }
}