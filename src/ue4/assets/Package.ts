import { FileProvider } from "../../fileprovider/FileProvider";
import { Ue4Version } from "../versions/Game";
import { FPackageIndex } from "../objects/uobject/ObjectResource";
import { UObject } from "./exports/UObject";
import { UStruct } from "./exports/UStruct";
import { UScriptStruct } from "./exports/UScriptStruct";
import { Locres } from "../locres/Locres";

export abstract class Package extends UObject {
    fileName: string
    provider?: FileProvider = null
    game: number = this.provider?.game || Ue4Version.GAME_UE4_LATEST

    protected constructor(fileName: string, provider: FileProvider, game: number) {
        super()
        this.fileName = fileName
        this.provider = provider
        this.game = game
    }

    abstract exportsLazy: UObject[]
    get exports(): UObject[] {
        return this.exportsLazy.map(it => it)
    }
    packageFlags = 0

    protected static constructExport(struct: UStruct): UObject {
        let current = struct
        while (current) {
            const c = (current as UScriptStruct)?.structClass
            if (c) {
                const nc = new c.constructor() as UObject
                nc.clazz = struct
                return nc
            }
            current = current.superStruct
        }
        const u = new UObject()
        u.clazz = struct
        return u
    }

    /**
     * @returns the first export of the given type
     * @throws {TypeError} if there is no export of the given type
     */
    getExportOfType<T extends UObject>(type: T) {
        const obj = this.getExportsOfType(type)[0]
        if (obj)
            return obj
        throw new TypeError(`Could not find export of type '${type.name}'`)
    }

    /**
     * @returns the first export of the given type or null if there is no
     */
    getExportOfTypeOrNull<T extends UObject>(type: T) {
        return this.getExportsOfType(type)[0] || null
    }

    /**
     * @returns the all exports of the given type
     */
    getExportsOfType<T extends UObject>(type: T) {
        return this.exports.filter(e => e instanceof (type as any))
    }

    abstract findObject<T>(index: FPackageIndex): T
    loadObject<T>(index: FPackageIndex) {
        return this.findObject<T>(index)
    }

    abstract findObjectByName(objectName: string, className?: string): UObject
    abstract toJson(locres?: Locres): IJson[]
}

export interface IJson {
    type: string,
    name: string,
    properties: any
}