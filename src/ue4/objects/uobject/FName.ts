import { FNameEntry } from "./FNameEntry";
import { Utils } from "../../../util/Utils";

export class FName {
    nameMap: FNameEntry[] = []
    index: number = 0
    num: number = 0

    constructor(nameMap?: any[], index?: number, num?: number) {
        this.nameMap = nameMap
        this.index = index
        this.num = num
    }

    toString() {
        return this.text
    }

    get text(): string {
        const name = this.index === -1 ? "None" : this.nameMap[this.index].name
        return this.num === 0 ? name : `${name}_${this.num - 1}`
    }
    set text(v) {
        this.nameMap[this.num].name = v
    }

    equals(other: any): boolean {
        if (this === other) return true;
        if (other !instanceof FName) return false;
        return this.text === other.text
    }

    hashCode(): number {
        let result = this.num
        result = 31 * result + Utils.hash(this.text.toLowerCase())
        return result
    }

    isNone(): boolean {
        return this.text === "None"
    }

    static FNameDummy = class extends FName {
        name: string
        num: number = 0

        constructor(name: string, num: number) {
            super([], -1)
            this.name = name
            this.num = num
            super.num = num
        }

        get text(): string {
            return this.num === 0 ? this.name : `${this.name}_${this.num - 1}`
        }
        set text(v) {
            this.name = v
        }
    }

    static NAME_None = new FName()

    static dummy(text: string, num: number) {
        return new this.FNameDummy(text, num)
    }

    static getByNameMap(text: string, nameMap: FNameEntry[]): FName {
        const nameEntry = nameMap.find(f => f.name === text)
        return nameEntry ? new FName(nameMap, nameMap.indexOf(nameEntry), 0) : null
    }

    static createFromDisplayId(text: string, num: number) {
        return this.dummy(text, num)
    }
}