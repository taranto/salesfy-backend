import { Column, DataType, IBuildOptions, Table } from "sequelize-typescript";
import { FilteredModelAttributes } from "sequelize-typescript/lib/models/Model";
import { LayerEntity } from "./../../layers_template/LayerEntity";
import { ILocalStorage } from "./ILocalStorage";

@Table({
    tableName: "localstorage",
})
export class LocalStorage extends LayerEntity<LocalStorage> implements ILocalStorage {

    public id = "idLocalStorage"

    @Column({ type: DataType.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true, field: 'idlocalstorage' })
    public idLocalStorage: number
    @Column({ type: DataType.TEXT, allowNull: false, field: 'nmkey', unique: true })
    public nmKey: string
    @Column({ type: DataType.TEXT, allowNull: true, field: 'dsvalue' })
    public dsValue: string
    @Column({ type: DataType.DATE, allowNull: true, field: 'dhstorage' })
    public dhStorage: Date

    constructor(values?: FilteredModelAttributes<LocalStorage>, options?: IBuildOptions) {
        super(values, options);
    }
}
