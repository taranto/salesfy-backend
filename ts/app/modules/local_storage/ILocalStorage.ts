import { IEntity } from "salesfy-shared/ts/EntryPoint";

export interface ILocalStorage extends IEntity {
    idLocalStorage: number,
    nmKey: string,
    dsValue: string
    dhStorage: Date
}
