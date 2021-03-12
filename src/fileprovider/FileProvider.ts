import Collection from "@discordjs/collection";
import { Ue4Version } from "../ue4/versions/Game";
import { GameFile } from "../ue4/pak/GameFile";

export abstract class FileProvider {
    abstract game: number
    mappingsProvider: any
    protected abstract files: Collection<string, GameFile>

    getFiles() {
        return this.files
    }

    /**
     * - the name of the game that is loaded by the provider
     */
    get gameName(): string {
        const first = this.files.keys()[0]
        const subStr = first ? first.substring(0, first.indexOf("/")) : ""
        return subStr.endsWith("game") ? subStr.substring("game", first.indexOf(0)) : ""
    }

    /**
     * Searches for a game file by its path
     * @param filePath the path to search for
     * @returns the game file or null if it wasn't found
     */
    abstract findGameFile(filePath: string): GameFile

    /**
     * Loads a UE4 package
     * @param file the game file to load
     * @returns the parsed package or null if the file was not an ue4 package (.uasset)
     */
    abstract loadGameFile(file: GameFile): Promise<any>

    /**
     * Loads a UE4 package from I/O Store by package ID.
     * @param packageId the package ID to load.
     * @returns the parsed package
     */
    abstract loadGameFile(packageId: any): Promise<any>

    async loadObject<T>(objectPath: string): Promise<T>
    async loadObject<T>(softObjectPath: any): Promise<T>
    async loadObject(objectPath?: string): Promise<any> {
        if (objectPath == null || objectPath === "None") return null;
        let packagePath = objectPath
        //let objectName: string
        const dotIndex = packagePath.indexOf(".")
        if (dotIndex === -1) {
          //  objectName = packagePath.substring(packagePath.lastIndexOf("/") + 1)
        } else {
           // objectName = packagePath.substring(dotIndex + 1)
            packagePath = packagePath.substring(0, dotIndex)
        }
        return await this.loadGameFile(packagePath)
    }

    /**
     * Searches for the game file and then load its contained locres
     * @param filePath the path to search for
     * @returns the parsed package or null if the path was not found or the found game file was not an ue4 package (.uasset)
     */
    //loadLocres(filePath: string): any

    /**
     * Loads a UE4 Locres file
     * @param file the game file to load
     * @returns the parsed locres or null if the file was not an ue4 locres (.locres)
     */
    //loadLocres(file: any): any


    /**
     * Searches for the game file and then loads a UE4 AssetRegistry file
     * @param filePath the path to search for
     * @return the parsed asset registry
     */
    abstract loadAssetRegistry(filePath: string): any

    /**
     * Loads a UE4 AssetRegistry file
     * @param file the game file to load
     * @returns the parsed asset registry
     */
    abstract loadAssetRegistry(file: any): any

    getLocresLanguageByPath(filePath: string) {
        return ""
    }

    loadLocres(ln: any): any {

    }

    /**
     * Searches for the game file and then saves all parts of this package
     * @param filePath the path to search for
     * @returns a map with the files name as key and data as value
     */
    abstract savePackage(filePath: string): Collection<string, Buffer>

    /**
     * Saves all parts of this package
     * @param file the game file to save
     * @returns a map with the files name as key and data as value
     */
    abstract savePackage(file: any): Map<string, Buffer>

    /**
     * Searches for the game file and then saves the it
     * @param filePath the game file to save
     * @returns the files data
     */
    abstract saveGameFile(filePath: string): Promise<Buffer>

    /**
     * Saves the game file
     * @param file the game file to save
     * @returns the files data
     */
    abstract saveGameFile(file: any): Promise<Buffer>

    /**
     * Saves a I/O Store chunk by its ID
     * @param chunkId the chunk ID
     * @returns the chunk data
     */
    abstract saveChunk(chunkId: any): Buffer

    /**
     * @param filePath the file path to be fixed
     * @returns the file path translated into the correct format
     */
    fixPath(filePath: string): string {
        let path = filePath.toLowerCase()
        path = path.replace("\\", "/")
        if (path.startsWith("/"))
            path = path.substring(1)
        const lastPart = path.substring(path.lastIndexOf("/") + 1)
        if (lastPart.includes(".") && lastPart.substring(0, lastPart.indexOf(".")) === lastPart.substring(lastPart.indexOf(".") + 1))
            path = path.substring(0, path.lastIndexOf(".")) + "/" + lastPart.substring(0, lastPart.indexOf("."))
        if (!path.endsWith("/") && !path.substring(path.lastIndexOf("/") + 1).includes("."))
            path += ".uasset"
        if (path.startsWith("game/")) {
            const gameName = this.gameName
            path =
                path.startsWith("game/content/") ? path.replace("game/content/", gameName + "game/content/") :
                path.startsWith("game/config/") ? path.replace("game/config/", gameName + "game/config/") :
                path.startsWith("game/plugins/") ? path.replace("game/plugins/", gameName + "game/plugins/") :
                (path.includes("assetregistry") || path.endsWith(".uproject")) ? path.replace("game/", `${gameName}game/`) :
                path.replace("game/", gameName + "game/content/")
        } else if (path.startsWith("engine/")) {
            path =
                path.startsWith("engine/content/") ? path :
                path.startsWith("engine/config/") ? path :
                path.startsWith("engine/plugins") ? path :
                path.replace("engine/", "engine/content/")
        }
        return path.toLowerCase()
    }

    /**
     * Compacts a file path
     * @param path Path to compact
     * @warning This does convert FortniteGame/Plugins/GameFeatures/GameFeatureName/Content/Package into /GameFeatureName/Package
     */
    compactFilePath(path: string): string {
        if (path[0] === "/") {
            return path
        }
        if (path.startsWith("Engine/Content")) { // -> /Engine
            return "/Engine" + path.substring("Engine/Content".length)
        }
        if (path.startsWith("Engine/Plugins")) { // -> /Plugins
            return path.substring("Engine".length)
        }
        const delim = path.indexOf("/Content/")
        return delim === -1 ? path : "/Game" + path.substring(delim + "/Content".length)
    }
}