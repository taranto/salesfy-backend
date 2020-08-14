import { LayerDao } from "app/layers_template/LayerDao";
import { Transaction } from "sequelize";
import { IChannel, CtCardState, CtUserGroupAccess } from "salesfy-shared";
import { Env } from "app/structure/Env";
import { Channel } from "app/modules/channel/Channel";
import { DaoUtil } from "app/util/DaoUtil";
import { ContentDao } from "app/modules/content/ContentDao";

export interface IChannelDaoParam {
	idContentChannel?: number, idChannelNotIn?: number, idChannel?: number, idPublisher?: number, idUserScope?: number,
	idContent?: number, idWorkspace?:number,
	isPlaybook?: boolean, idCtUserGroupAccess?: number, isChannelAdmin?: boolean
	qtLimit?: number, qtOffset?: number,
	nmGroup?: string, nmChannel?: string, dsChannel?: string, dsSearch?: string, nmPublisher?: string, nmTag?: string,
	arIdChannel?: number[], arIdChannelNotIn?: number[], arIdPublisher?: number[], arIdGroup?: number[],
	arIdTag?: number[],
	sbContentState?: boolean, isSelectQuoted?: boolean, sbStoriesDeadline?: boolean
}

export class ChannelDao extends LayerDao<Channel, IChannel> {

	constructor(t: Transaction) {
		super(t);
	}

	public async post(joParam: any | IChannel): Promise<IChannel> {
		const result = await super.create(Channel, joParam)
		return result
	}

	public async put(joParam: any): Promise<IChannel> {
		const result = await super.update(Channel, joParam)
		return result
	}

	public async get(joParam: IChannelDaoParam): Promise<IChannel[]> {
		const query = this.getQuery(joParam)
		const qtLimitQtOffsetFilter = DaoUtil.qtLimitQtOffsetFilter(joParam)
		const dsQueryLimited = `${query} ${qtLimitQtOffsetFilter}`
		const result = await this.query(dsQueryLimited)
		return result
	}

	public getQuery(joParam: IChannelDaoParam): string {
		const dsSelect = this.getSelect(joParam)
		const dsJoin = this.getJoin(joParam)
		const dsWhere = this.getWhere(joParam)
		const dsGroupBy = this.getGroupBy(joParam)
		const dsSort = this.getSort(joParam)

		const query = `
			select distinct ${dsSelect}
			from channel ch
			${dsJoin}
			where true
			${dsWhere}
			${dsGroupBy}
			${dsSort}
		`
		return query
	}

	private getSelect(joParam: IChannelDaoParam): string {
		const isSelectQuoted = LayerDao.isSelectQuoted(joParam)
		const idCtUserGroupAccess = joParam.idUserScope ?
			`min(coalesce(ug.idCtUserGroupAccess, ${CtUserGroupAccess.reader.key}))` : CtUserGroupAccess.reader.key+""
		let dsSelect = `
			${DaoUtil.getCsNmField(Channel.getArNmField(), "ch", isSelectQuoted)},
			${DaoUtil.getCsNmField([idCtUserGroupAccess], "", isSelectQuoted, ["idCtUserGroupAccess"])},
			${DaoUtil.getCsNmField(["nmUser"], "uPublisher", isSelectQuoted, ["nmPublisher"])}`
		if (joParam.idUserScope) {
			dsSelect = dsSelect + `,
				${DaoUtil.getCsNmField(["dhLastConversion"], "uch", isSelectQuoted)}`
		}
		if (joParam.sbContentState) {
			dsSelect = `${dsSelect},
				${DaoUtil.getCsNmField(["keyCtContentState", "dhUpdate", "dhPublish"],
					"c", isSelectQuoted, ["keyCtContentState", "dhUpdateContent", "dhPublishContent"])} `
		}
		return dsSelect
	}

	public getJoin(joParam: IChannelDaoParam): string {
		const sbContentStateBaseJoin = this.getCtContentStateBaseJoin(joParam)
		const dsUserUchJoinWhere = joParam.idUserScope ? ` and uch.idUser = ${joParam.idUserScope}` : ""
		const dsJoin = `
			join usr uPublisher on uPublisher.idUser = ch.idPublisher
			left join userChannel uch on uch.idChannel = ch.idChannel ${dsUserUchJoinWhere}
			left join channelGroup chg on chg.idChannel = ch.idChannel
			left join grp g using (idGroup)
			left join userGroup ug using(idGroup)
			left join channelTag cht on cht.idChannel = ch.idChannel
			left join tag t on t.idTag = cht.idTag
			left join workspace w using (idWorkspace)
			${sbContentStateBaseJoin}
		`
		return dsJoin
	}

	private getCtContentStateBaseJoin(joParam: any): string {
		if (!joParam.sbContentState) {
			return ""
		}
		const sbCardStateBaseQuery = this.getCtContentStateBaseQuery(joParam)
		const queryJoin = `left join (${sbCardStateBaseQuery}) c on c.idChannel = ch.idChannel`
		return queryJoin
	}

	private getCtContentStateBaseQuery(joParam: {
		idUserScope?: number, sbContentState?: boolean, idChannel?: number,
		idContent?: number, sbStoriesDeadline?: boolean
	}): string {
		const idChannelWhere = joParam.idChannel ? ` and ch.idchannel = ${joParam.idChannel} ` : ""
		const idContentWhere = joParam.idContent ? ` and c.idContent = ${joParam.idContent} ` : ""
		const dsUserUchJoinWhere = joParam.idUserScope ? ` and uch.idUser = ${joParam.idUserScope}` : ""
		const dsUserUcJoinWhere = joParam.idUserScope ? ` and uc.idUser = ${joParam.idUserScope}` : ""
		const sbStoriesDeadlineWhere = this.getStoriesDeadlineWhere(joParam)
		const dsSelectCaseCtContentState = ContentDao.getSelectCaseCtContentState({ isSelectQuoted: false })
		const queryJoin = `
			select distinct on (ch.idChannel) ${dsSelectCaseCtContentState},
			ch.idChannel, c.dhUpdate, c.dhPublish
			from channel ch
			left join userChannel uch on uch.idChannel = ch.idChannel ${dsUserUchJoinWhere}
			left join contentChannel cch on cch.idChannel = ch.idChannel
			left join content c on c.idContent = cch.idContent
			left join userContent uc on uc.idContent = c.idContent ${dsUserUcJoinWhere}
			where true
			and c.isActive
			${idChannelWhere}
			${idContentWhere}
			${sbStoriesDeadlineWhere}
			order by ch.idChannel, keyCtContentState asc
		`
		return queryJoin
	}

	private getWhere(joParam: IChannelDaoParam): string {
		const idCtUserGroupAccessWhere = joParam.idCtUserGroupAccess != undefined ?
			` and idCtUserGroupAccess = ${joParam.idCtUserGroupAccess} ` : ""
		const isChannelAdminWhere = joParam.isChannelAdmin != undefined ?
			` and (idCtUserGroupAccess = ${CtUserGroupAccess.admin.key} or ch.idPublisher = ${joParam.idUserScope}) ` : ""
		const idChannelNotInWhere = joParam.idChannelNotIn ? ` and ch.idChannel != ${joParam.idChannelNotIn}` : ""
		const arIdChannelNotInWhere = joParam.arIdChannelNotIn != undefined && joParam.arIdChannelNotIn.length > 0 ?
			`and ch.idChannel not in (${joParam.arIdChannelNotIn}) ` : ""
		const arIdGroupWhere = joParam.arIdGroup ? ` and idGroup in (${joParam.arIdGroup}) ` : ""
		const isPlaybookWhere = joParam.isPlaybook != undefined ? `and isPlaybook = ${joParam.isPlaybook}` : ""
		const idChannelWhere = joParam.idChannel ? ` and ch.idChannel = ${joParam.idChannel} ` : ""
		const idPublisherWhere = joParam.idPublisher ? ` and idPublisher = ${joParam.idPublisher} ` : ""
		const arIdPublisherWhere = joParam.arIdPublisher ? ` and idPublisher in (${joParam.arIdPublisher}) ` : ""
		const arIdChannelWhere = joParam.arIdChannel ? ` and ch.idChannel in (${joParam.arIdChannel})` : ""
		const arIdTagWhere = (joParam.arIdTag != undefined && joParam.arIdTag.length > 0) ?
			`and t.idTag in (${joParam.arIdTag}) ` : ""
		const idWorkspaceWhere = joParam.idWorkspace ? ` and w.idWorkspace = ${joParam.idWorkspace}` : ""
		const sbStoriesDeadlineWhere = this.getStoriesDeadlineWhere(joParam)
		const chAccessWhere = this.getChAccessWhere(joParam.idUserScope)
		const dsWhereString = this.getDsSearchWhere(joParam)
		const dsWhere = `
			and ch.isActive
			and (w.isActive or w.isActive is null)
			${arIdGroupWhere}
			${isPlaybookWhere}
			${idChannelWhere}
			${idPublisherWhere}
			${arIdPublisherWhere}
			${arIdPublisherWhere}
			${arIdTagWhere}
			${arIdChannelWhere}
			${arIdChannelNotInWhere}
			${idChannelNotInWhere}
			${isChannelAdminWhere}
			${idCtUserGroupAccessWhere}
			${idWorkspaceWhere}
			${dsWhereString}
			${chAccessWhere}
			${sbStoriesDeadlineWhere}
		`
		return dsWhere
	}

	private getDsSearchWhere(joParam: IChannelDaoParam): string {
		const arNmPartial = ["dsSearch", "nmTag", "nmGroup", "nmPublisher", "nmChannel", "dsChannel"]
		let joParamWhere = DaoUtil.asPartialStrings(joParam, arNmPartial, { isOpenPrefix: true, isOpenSuffix: true })
		joParamWhere = DaoUtil.escapeStrings(joParamWhere)
		let dsWhereString = ``
		if (joParamWhere.dsSearch) {
			dsWhereString = `
		and (
			ch.nmChannel ilike ${joParamWhere.dsSearch} or
			ch.dsChannel ilike ${joParamWhere.dsSearch} or
			uPublisher.nmUser ilike ${joParamWhere.dsSearch} or
			t.nmTag ilike ${joParamWhere.dsSearch} or
			g.nmGroup ilike ${joParamWhere.dsSearch}
		)`
		} else {
			const nmChannelWhere = joParamWhere.nmChannel ? `and ch.nmChannel ilike ${joParamWhere.nmChannel} ` : "";
			const dsChannelWhere = joParamWhere.dsChannel ? `and ch.dsChannel ilike ${joParamWhere.dsChannel} ` : "";
			const nmPublisherWhere = joParamWhere.nmPublisher ? `and uPublisher.nmUser ilike ${joParamWhere.nmPublisher} ` : "";
			const nmTagWhere = joParamWhere.nmTag ? `and t.nmTag ilike ${joParamWhere.nmTag} ` : "";
			const nmGroupWhere = joParamWhere.nmGroup ? `and g.nmGroup ilike ${joParamWhere.nmGroup} ` : "";
			dsWhereString = `
		${nmChannelWhere}
		${dsChannelWhere}
		${nmPublisherWhere}
		${nmTagWhere}
		${nmGroupWhere}
			`
		}
		return dsWhereString
	}

	private getChAccessWhere(idUserScope?: number): string {
		if (!idUserScope) {
			return ``
		}
		const chAccessWhere = `
			and (
				(ch.isPlaybook = false and (ug.idUser = ${idUserScope} or ug.idUser is null)) or
				(ch.idPublisher = ${idUserScope} and (ug.idUser = ${idUserScope} or ug.idUser is null)) or
				(ch.isPlaybook and ug.idUser = ${idUserScope} and g.isActive )
			)`
		return chAccessWhere
	}

	private getSort(joParam: { idUserScope?: number, nmSort?: string, isSelectQuoted?: boolean }): string {
		let dsSortConditions = ""
		const isSelectQuoted = LayerDao.isSelectQuoted(joParam, true)
		const nmTableCH = isSelectQuoted ? "" : "ch"
		const nmTableUCH = isSelectQuoted ? "" : "uch"
		const nmTableC = isSelectQuoted ? "" : "c"
		if (joParam.idUserScope && (joParam.nmSort == "dhLastConversion" || joParam.nmSort == undefined)) {
			dsSortConditions += ` ${DaoUtil.getCsNmField(["dhLastConversion"], nmTableUCH, isSelectQuoted)} desc NULLS LAST `
		}
		dsSortConditions += joParam.nmSort == "nmChannel" ?
			`${DaoUtil.getCsNmField(["nmChannel"], nmTableCH, isSelectQuoted)} asc` : ""
		dsSortConditions += joParam.nmSort == "dhPublish" ?
			`${DaoUtil.getCsNmField(["dhPublish"], nmTableCH, isSelectQuoted)} desc` : ""
		dsSortConditions += joParam.nmSort == "keyCtContentState" ?
			`${DaoUtil.getCsNmField(["keyCtContentState"], nmTableC, isSelectQuoted)} asc NULLS LAST` : ""
		dsSortConditions += joParam.nmSort == undefined && !joParam.idUserScope ?
			`${DaoUtil.getCsNmField(["dhPublish"], nmTableCH, isSelectQuoted)} asc` : ""
		const dsSort = dsSortConditions != "" ? `order by ${dsSortConditions}` : ""
		return dsSort
	}

	private getGroupBy(joParam: IChannelDaoParam): string {
		if (!joParam.idUserScope) {
			return ""
		}
		const isSelectQuoted = LayerDao.isSelectQuoted(joParam)
		const nmTable = isSelectQuoted ? "" : "ch"
		let dsGroupBy = `group by
			${DaoUtil.getCsNmField(Channel.getArNmField(), nmTable, isSelectQuoted)},
			${DaoUtil.getCsNmField(["nmPublisher", "dhLastConversion"], "", isSelectQuoted)}`
		if (joParam.sbContentState) {
			dsGroupBy = `${dsGroupBy},
				${DaoUtil.getCsNmField(["keyCtContentState", "dhUpdateContent", "dhPublishContent"], "", isSelectQuoted)} `
		}
		return dsGroupBy
	}

	private getStoriesDeadlineWhere(joParam: { sbStoriesDeadline?: boolean }): string {
		if (!joParam.sbStoriesDeadline) {
			return ""
		}
		const sqlDeadline = `and (
			c.dhUpdate > (CURRENT_TIMESTAMP - interval '7 days')
			or c.dhPublish > (CURRENT_TIMESTAMP - interval '7 days')
		)`
		return sqlDeadline
	}

	private getWhereStories(joParam: { idUserScope: number }): string {
		return `and (
			(
				u.idUser = ${joParam.idUserScope}
				and ut.idUserTag is not null
				and ch.isPlaybook = false
			) or (
				ch.isPlaybook = true
			)
		)`
	}

	public async getStories(
		joParam: { idUserScope: number, qtLimit?: number, qtOffset?: number }): Promise<IChannel[]> {
		const joParamStories = { ...joParam, sbContentState: true, sbStoriesDeadline: true }
		const dsSelect = this.getSelect(joParamStories)
		const dsJoin = this.getJoin(joParamStories)
		const dsWhere = this.getWhere(joParamStories)
		const dsWhereStories = this.getWhereStories(joParamStories)
		const dsGroupBy = this.getGroupBy(joParamStories)
		const qtLimitQtOffsetFilter = DaoUtil.qtLimitQtOffsetFilter(joParamStories)

		const query = `
			select distinct ${dsSelect}
			from channel ch
			${dsJoin}
			left join usertag ut on t.idtag = ut.idtag or t.idtag in (${Env.getBsnArIdAutoTagsStories()})
			left join usr u on ut.iduser = u.iduser
			where true
			and ch.idChannel not in (${Env.getBsnArIdHiddenChannels()})
			${dsWhere}
			${dsWhereStories}
			${dsGroupBy}
			order by c.keyCtContentState asc, c.dhUpdate desc nulls first, c.dhPublish desc nulls first
			${qtLimitQtOffsetFilter}
		`
		const result = await this.query(query)
		return result
	}
}
