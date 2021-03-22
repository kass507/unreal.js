import { CompressionMethod } from "../CompressionMethod";
import { FPakCompressedBlock } from "./FPakCompressedBlock";
import {
    PakVersion_CompressionEncryption,
    PakVersion_FNameBasedCompressionMethod,
    PakVersion_NoTimestamps, PakVersion_RelativeChunkOffsets
} from "../enums/PakVersion";
import { FPakInfo } from "./FPakInfo";
import { FPakArchive } from "../reader/FPakArchive";

export class FPakEntry {
    name: string
    pos: number
    size: number
    uncompressedSize: number
    compressionMethod: CompressionMethod
    //hash: Buffer
    compressionBlocks: FPakCompressedBlock[]
    isEncrypted: boolean = false
    compressionBlockSize: number = 0

    static getSerializedSize(version: number, compressionMethod: number = 0, compressionBlocksCount: number = 0): number {
        let serializedSize = /*this.pos*/ 8 + /*this.size*/ 8 + /*this.uncompressedSize*/ 8 + /*this.hash*/ 20
        serializedSize += 4

        if (version >= PakVersion_CompressionEncryption) {
            serializedSize += /*this.isEncrypted*/ 1 + /*this.compressionBlockSize*/ 4
            if (compressionMethod !== 0) {
                serializedSize += /*FPakCompressedBlock*/ 8 * 2 * compressionBlocksCount + /*int32*/ 4
            }
        }
        if (version < PakVersion_NoTimestamps) {
            serializedSize += /*timestamp*/ 8
        }

        return serializedSize
    }

    constructor(
        pakInfo: FPakInfo,
        name: string,
        pos: number,
        size: number,
        uncompressedSize: number,
        compressionMethodIndex: number,
        //hash: ByteArray,
        compressionBlocks: FPakCompressedBlock[],
        isEncrypted: boolean,
        compressionBlockSize: number
    )
    constructor(Ar: FPakArchive, inIndex: boolean)
    constructor(...params) {
        if (params[0] instanceof FPakArchive) {
            const Ar = params[0]
            const inIndex = params[1]
            this.name = inIndex ? Ar.readString() : ""
            this.pos = Ar.readInt64()
            this.size = Ar.readInt64()
            this.uncompressedSize = Ar.readInt64()
            if (Ar.pakInfo.version >= PakVersion_FNameBasedCompressionMethod) {
                try {
                    this.compressionMethod = CompressionMethod[Ar.pakInfo.compressionMethods[Ar.readInt32()]]
                } catch (e) {
                    this.compressionMethod = CompressionMethod.Unknown
                }
            } else {
                switch (Ar.readInt32()) {
                    case 0:
                        this.compressionMethod = CompressionMethod.None
                        break
                    case 4:
                        this.compressionMethod = CompressionMethod.Oodle
                        break
                    default:
                        this.compressionMethod = CompressionMethod.Unknown
                        break
                }
            }
            if (Ar.pakInfo.version < PakVersion_NoTimestamps)
                Ar.skip(8)
            Ar.skip(20) // hash

            this.compressionBlocks = []
            if (Ar.pakInfo.version >= PakVersion_CompressionEncryption) {
                if (this.compressionMethod !== CompressionMethod.None)
                    this.compressionBlocks = Ar.readArray(() => new FPakCompressedBlock())
                this.isEncrypted = Ar.readFlag()
                this.compressionBlockSize = Ar.readInt32()
            }
            if (Ar.pakInfo.version >= PakVersion_RelativeChunkOffsets) {
                this.compressionBlocks.forEach((it) => {
                    it.compressedStart += this.pos
                    it.compressedEnd += this.pos
                })
            }
        } else {
            this.name = params[1]
            this.pos = params[2]
            this.size = params[3]
            this.uncompressedSize = params[4]
            if (CompressionMethod[params[0].compressionMethods[params[5]]]) {
                this.compressionMethod = CompressionMethod[params[0].compressionMethods[params[5]]]
            } else {
                this.compressionMethod = CompressionMethod.Unknown
            }
            //this.hash = params[6]
            this.compressionBlocks = params[6]
            this.isEncrypted = params[7]
            this.compressionBlockSize = params[8]
        }
    }
}