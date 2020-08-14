import { LayerDao } from "app/layers_template/LayerDao"
import { Transaction } from "app/structure/DbConn"
import { IChannelGroup, CtUserGroupAccess } from "salesfy-shared"
import { ChannelGroup } from "app/modules/channel_group/ChannelGroup"
import { DaoUtil } from "app/util/DaoUtil"

export class ChannelGroupDao extends LayerDao<ChannelGroup, IChannelGroup> {

	constructor(t: Transaction) {
		super(t)
	}

	public async get(joParam: {
		nmChannel?: string, idChannel?: number, qtLimit?: number, qtOffset?: number, idUserPublisher?:number
		idGroup?: number, nmGroup?: string, idChannelGroup?:number, idUser?:number, idCtUserGroupAccess?:number,
		arIdGroup?: number[], arIdChannel?:number[]
		isAllGroups?:boolean, idUserScope?:number
	}): Promise<IChannelGroup[]> {
		joParam = DaoUtil.escapeStrings(joParam)
		const qtLimitQtOffsetFilter = DaoUtil.qtLimitQtOffsetFilter(joParam)
		const idChannelFilter = joParam.idChannel == undefined ? "" : ` and ch.idChannel = ${joParam.idChannel} `
		const nmChannelFilter = joParam.nmChannel == undefined ? "" : ` and ch.nmChannel like ${joParam.nmChannel} `
		const idGroupFilter = joParam.idGroup == undefined ? "" : ` and g.idGroup = ${joParam.idGroup} `
		const nmGroupFilter = joParam.nmGroup == undefined ? "" : ` and g.nmGroup like ${joParam.nmGroup} `
		const idUserFilter = joParam.idUser == undefined ? "" : ` and u.idUser = ${joParam.idUser} `
		const idUserPublisherFilter = joParam.idUserPublisher == undefined ? "" :
			` and ch.idPublisher = ${joParam.idUserPublisher} `
		const idCtUserGroupAccessFilter = joParam.idCtUserGroupAccess != undefined ?
			` and ug.idCtUserGroupAccess = ${joParam.idCtUserGroupAccess}` : ""
		const idUserScopeFilter = joParam.idUserScope == undefined ? "" :
			` and (u.idUser = ${joParam.idUserScope} or ch.idPublisher = ${joParam.idUserScope})
			  and ug.idUser = ${joParam.idUserScope} `
		const idChannelGroupFilter =
			joParam.idChannelGroup == undefined ? "" : ` and chg.idChannelGroup = ${joParam.idChannelGroup} `
		const isAllGroupJoin = !joParam.isAllGroups || joParam.idUserScope == undefined ? "" :
			` join channelgroup chgMe on ch.idChannel = chgMe.idChannel
			  join grp gMe on chgMe.idGroup = gMe.idGroup
			  join userGroup ugMe on chgMe.idGroup = ugMe.idGroup `
		const isAllGroupFilter = !joParam.isAllGroups || joParam.idUserScope == undefined ? "" :
			` and ugMe.idCtUserGroupAccess = ${CtUserGroupAccess.admin.key} and ugMe.idUser = ${joParam.idUserScope}`
		const arIdChannelWhere = joParam.arIdChannel != undefined && joParam.arIdChannel.length > 0 ?
			`and ch.idChannel in (${joParam.arIdChannel}) ` : ""
		const arIdGroupWhere = joParam.arIdGroup != undefined && joParam.arIdGroup.length > 0 ?
			`and g.idGroup in (${joParam.arIdGroup}) ` : ""

		const query = `select ${DaoUtil.getCsNmField(ChannelGroup.getArNmField(), "chg", true)},
			${DaoUtil.toSelect("ch", "idChannel", "nmChannel")},
			${DaoUtil.toSelect("ug", "idUserGroup", "idCtUserGroupAccess")},
			${DaoUtil.toSelect("g", "nmGroup")},
			${DaoUtil.toSelect("u", "nmUser", "idUser")}
			from channel ch
			join channelgroup chg on ch.idChannel = chg.idChannel
			join grp g on chg.idGroup = g.idGroup
			join userGroup ug on chg.idGroup = ug.idGroup
			${isAllGroupJoin}
			join usr u on ug.idUser = u.idUser
			where true
			${isAllGroupFilter}
			${idChannelFilter}
			${nmChannelFilter}
			${idGroupFilter}
			${nmGroupFilter}
			${idUserFilter}
			${idCtUserGroupAccessFilter}
			${idUserPublisherFilter}
			${idUserScopeFilter}
			${idChannelGroupFilter}
			${arIdChannelWhere}
			${arIdGroupWhere}
			and g.isActive
			and ch.isActive
			and u.isActive
			${qtLimitQtOffsetFilter}`
		const result = await this.query(query)
		return result
	}

	public async post(joParam: any): Promise<IChannelGroup> {
		const result: any = await ChannelGroup.create(joParam, { transaction: this.t, returning: true })
			.catch((err:any) => this.defaultCatchError(err))
		const channelGroup: IChannelGroup = result.dataValues
		return channelGroup
	}

	public async delete(joParam: any): Promise<void> {
		const result: any = await ChannelGroup.destroy(
			{ transaction: this.t, where: { idChannelGroup: joParam.idChannelGroup } }
		)
			.catch((err:any) => this.defaultCatchError(err))
		return
	}
}
