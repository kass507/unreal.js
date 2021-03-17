export class ObjectRef<T> {
    element: T

    constructor(element?: T) {
        this.element = element
    }

    static ref<T>(element: T) {
        return new ObjectRef<T>(element)
    }
}