import { LayerDao } from "../../layers_template/LayerDao";
import { IContent, CtContent, CtCardState, CtUserGroupAccess } from "salesfy-shared";
import { Transaction } from "sequelize";
import { Content } from "app/modules/content/Content";
import { HExcep } from "app/util/status/HExcep";
import { DaoUtil } from "app/util/DaoUtil";
import { ChannelDao } from "app/modules/channel/ChannelDao";
import { UserContent } from "app/modules/user_content/UserContent";

export interface IContentDaoParam {
	idContentChannel?: number, idContent?: number, idUserScope?: number, idChannel?: number, idPublisher?: number,
	idWorkspace?:number,
	isActive?: boolean, isChannelActive?: boolean, isPlaybook?: boolean, isFavorite?: boolean, hasLink?: boolean,
	qtOffset?: number, qtLimit?: number,
	nmSort?: string, dsContent?: string, dsSearch?: string, dsChannel?: string,
	nmContent?: string, nmTag?: string, nmGroup?: string, nmPublisher?: string, nmCtContent?: string, nmChannel?: string,
	arIdContentNotIn?: number[], arIdContent?: number[], arIdChannel?: number[], arIdGroup?: number[],
	arIdPublisher?: number[], arIdCtContent?: number[], arIdTag?: number[],
	isSelectQuoted?: boolean
}
export class ContentDao extends LayerDao<Content, IContent> {

	constructor(t: Transaction) {
		super(t);
	}

	public async updateTotalEvaluation(idContent: number): Promise<IContent> {
		const query = `
		with evalCounted as (
			select
				c.idContent,
				count(uc.idContent) filter (where uc.vlEval is not null) as qtEval,
				avg(uc.vlEval) filter (where uc.vlEval is not null) as vlEval
			from content c
			join usercontent uc using(idContent)
			where c.idContent = ${idContent}
			group by c.idContent
		)
		update content
		set qtEval = evalCounted.qtEval, vlEval = evalCounted.vlEval
		from evalCounted
		where content.idContent = ${idContent}
		returning ${DaoUtil.getCsNmField(Content.getArNmFieldPublic(), "content", true)}`
		const result = await this.query(query)
		return result[0]
	}

	public async addFavorite(idContent: number): Promise<IContent> {
		const result = await this.doOp(Content, idContent, "idContent", "qtFavorite = qtFavorite+1")
		return result
	}

	public async subtractFavorite(idContent: number): Promise<IContent> {
		const result = await this.doOp(Content, idContent, "idContent", "qtFavorite = qtFavorite-1")
		return result
	}

	public async addLike(idContent: number): Promise<IContent> {
		const result = await this.doOp(Content, idContent, "idContent", "qtLike = qtLike+1")
		return result
	}

	public async subtractLike(idContent: number): Promise<IContent> {
		const result = await this.doOp(Content, idContent, "idContent", "qtLike = qtLike-1")
		return result
	}

	public async addView(idContent: number): Promise<IContent> {
		const result = await this.doOp(Content, idContent, "idContent", "qtView = qtView+1")
		return result
	}

	public async addViews(arIdContent: number[]): Promise<IContent[]> {
		const result = await this.doOpMulti(Content, arIdContent, "idContent", "qtView = qtView+1")
		return result
	}

	public async addConversion(idContent: number): Promise<IContent> {
		const result = this.doOp(Content, idContent, "idContent", "qtConversion = qtConversion+1")
		return result
	}

	public async upsert(joParam: any): Promise<IContent> {
		const result = await super.upsert(Content, joParam)
		return result
	}

	public async create(joParam: any): Promise<IContent> {
		const result = await super.create(Content, joParam)
		return result
	}

	public async get(joParam: IContentDaoParam): Promise<IContent[]> {
		const query = this.getQuery(joParam)
		const qtLimitQtOffsetFilter = DaoUtil.qtLimitQtOffsetFilter(joParam)
		const dsQueryLimited = `${query} ${qtLimitQtOffsetFilter}`
		const result = await this.query(dsQueryLimited)
		return result
	}

	public getQuery(joParam: IContentDaoParam): string {
		const dsSelect = this.getSelect(joParam)
		const dsJoin = this.getJoin(joParam)
		const dsWhere = this.getWhere(joParam)
		const dsGroupBy = this.getGroupBy(joParam)
		const dsSort = this.getSort(joParam)

		const query = `
			select distinct ${dsSelect}
			from content c
			${dsJoin}
			where true
			${dsWhere}
			${dsGroupBy}
			${dsSort}
		`
		return query
	}

	public getSelect(joParam: IContentDaoParam): string {
		const isSelectQuoted = LayerDao.isSelectQuoted(joParam)
		const arNmFieldFix = Content.getArNmFieldPublic().filter((nmField) => nmField != "qtView")
		let dsSelect = `
			${DaoUtil.getCsNmField(arNmFieldFix, "c", isSelectQuoted)},
			${DaoUtil.getCsNmField(["nmUser"], "uPublisher", isSelectQuoted, ["nmPublisher"])},
			${DaoUtil.getCsNmField(["nmCtContent"], "ctc", isSelectQuoted)}`
		if (joParam.idUserScope) {
			dsSelect = dsSelect + `,
				${DaoUtil.getCsNmField(["isFavorite", "isLike", "qtView", "dhLastConversion", "dhLastView"], "uc", isSelectQuoted)},
				${DaoUtil.getCsNmField(["vlEval"], "uc", isSelectQuoted, ["vlEvalUser"])}`
		}
		if (joParam.hasLink) {
			dsSelect = dsSelect + `, ${DaoUtil.getCsNmField(["lkContent"], "c", isSelectQuoted)} `
		}
		const idCtUserGroupAccessField = joParam.idUserScope ?
			`min(coalesce(ug.idCtUserGroupAccess, ${CtUserGroupAccess.reader.key}))` : CtUserGroupAccess.reader.key+""
		const dsIdCtUserGroupAccessSelect =
			`, ${DaoUtil.getCsNmField([idCtUserGroupAccessField], undefined, isSelectQuoted, ["idCtUserGroupAccess"])}`
		const dsSelectCaseCtContentState = ", " + ContentDao.getSelectCaseCtContentState(joParam)
		dsSelect = dsSelect + dsIdCtUserGroupAccessSelect + dsSelectCaseCtContentState
		return dsSelect
	}

	public getJoin(joParam: IContentDaoParam): string {
		const idPublisherJoinWhere = joParam.idPublisher ? ` and uPublisher.idUser = ${joParam.idPublisher}` : ""
		const dsUserUcJoinWhere = joParam.idUserScope ? ` and uc.idUser = ${joParam.idUserScope}` : ""
		const dsUserUsrJoinWhere = joParam.idUserScope ? ` and u.idUser = ${joParam.idUserScope}` : ""

		const dsJoin = `
			left join contentChannel cch using(idContent)
			left join channel ch on ch.idChannel = cch.idChannel and ch.isActive
			left join channelGroup chg on chg.idChannel = ch.idChannel
			left join grp g on g.idGroup = chg.idGroup and g.isActive
			left join userGroup ug on ug.idGroup = g.idGroup
			join usr uPublisher on uPublisher.idUser = c.idPublisher ${idPublisherJoinWhere}
			left join userContent uc on uc.idContent = c.idContent ${dsUserUcJoinWhere}
			left join usr u on uc.idUser = u.idUser ${dsUserUsrJoinWhere}
			join ctContent ctc on ctc.idCtContent = c.idCtContent
			left join contentTag ct on ct.idContent = c.idContent
			left join tag t on t.idTag = ct.idTag
			left join workspace w using (idWorkspace)`
		return dsJoin
	}

	public getCChAccessWhere(idUserScope?: number): string {
		if (!idUserScope) {
			return `and true `
		}
		const cChAccessWhere = `
		and (
			(c.isPlaybook = false) or
			c.idPublisher = ${idUserScope} or
			(ch.idChannel is not null and ch.isPlaybook and ug.idUser = ${idUserScope}) or
			(ch.isPlaybook = false and c.isPlaybook = false and (ug.idUser = ${idUserScope} or ug.idUser is null)) or
			(ch.idPublisher = ${idUserScope} and (ug.idUser = ${idUserScope} or ug.idUser is null)) or
			(ch.isPlaybook and ug.idUser = ${idUserScope} and g.isActive)
		)`
		return cChAccessWhere
	}

	public getWhere(joParam: IContentDaoParam): string {
		const isActive = joParam.isActive != undefined ? `and c.isActive = ${joParam.isActive} ` : `and c.isActive `
		const isChannelActive = joParam.isChannelActive != undefined ? ` and ch.isActive = ${joParam.isChannelActive} ` : ``
		const cAccessWhere = this.getCChAccessWhere(joParam.idUserScope)
		const isFavoriteWhere = joParam.isFavorite != undefined && joParam.idUserScope ?
			`and uc.isFavorite = ${joParam.isFavorite} ` : ""
		const idContentWhere = joParam.idContent ? `and c.idContent = ${joParam.idContent} ` : ""
		const idChannelWhere = joParam.idChannel ? `and ch.idChannel = ${joParam.idChannel} ` : ""
		const isPlaybookWhere = joParam.isPlaybook != undefined ? `and c.isPlaybook = ${joParam.isPlaybook} ` : ""
		const arIdCtContentWhere = joParam.arIdCtContent ? `and ctc.idCtContent in (${joParam.arIdCtContent}) ` : ""
		const arIdChannelWhere = joParam.arIdChannel ? `and ch.idChannel in (${joParam.arIdChannel}) ` : ""
		const arIdPublisherJoinWhere = joParam.arIdPublisher ?
			`and uPublisher.idUser in (${joParam.arIdPublisher}) ` : ""
		const arIdContentNotInWhere = joParam.arIdContentNotIn != undefined && joParam.arIdContentNotIn.length > 0 ?
			`and c.idContent not in (${joParam.arIdContentNotIn}) ` : ""
		const arIdContentWhere = joParam.arIdContent != undefined && joParam.arIdContent.length > 0 ?
			`and c.idContent in (${joParam.arIdContent}) ` : ""
		const arIdTagWhere = (joParam.arIdTag != undefined && joParam.arIdTag.length > 0) ?
			`and t.idTag in (${joParam.arIdTag}) ` : ""
		const arIdGroupWhere = joParam.arIdGroup ? `and g.idGroup in (${joParam.arIdGroup}) ` : ""
		const idWorkspaceWhere = joParam.idWorkspace ? ` and w.idWorkspace = ${joParam.idWorkspace}` : ""

		const dsWhereString = this.getDsSearchWhere(joParam)
		const dsWhere = `
			and (w.isActive or w.isActive is null)
			${isActive}
			${isChannelActive}
			${idWorkspaceWhere}
			${cAccessWhere}
			${isFavoriteWhere}
			${idContentWhere}
			${idChannelWhere}
			${isPlaybookWhere}
			${arIdCtContentWhere}
			${arIdChannelWhere}
			${arIdPublisherJoinWhere}
			${arIdContentNotInWhere}
			${arIdContentWhere}
			${dsWhereString}
			${arIdTagWhere}
			${arIdGroupWhere}
		`
		return dsWhere
	}

	private getDsSearchWhere(joParam: IContentDaoParam): string {
		const arNmPartial = ["dsSearch",
			"nmContent", "dsContent", "nmTag", "nmGroup", "nmPublisher", "nmCtContent", "nmChannel", "dsChannel"]
		let joParamWhere = DaoUtil.asPartialStrings(joParam, arNmPartial, { isOpenPrefix: true, isOpenSuffix: true })
		joParamWhere = DaoUtil.escapeStrings(joParamWhere)
		let dsWhereString = ``
		if (joParamWhere.dsSearch) {
			dsWhereString = `
		and (
			c.nmContent ilike ${joParamWhere.dsSearch} or
			c.dsContent ilike ${joParamWhere.dsSearch} or
			ch.nmChannel ilike ${joParamWhere.dsSearch} or
			ch.dsChannel ilike ${joParamWhere.dsSearch} or
			ctc.nmCtContent ilike ${joParamWhere.dsSearch} or
			uPublisher.nmUser ilike ${joParamWhere.dsSearch} or
			t.nmTag ilike ${joParamWhere.dsSearch} or
			g.nmGroup ilike ${joParamWhere.dsSearch}
		)`
		} else {
			const nmContentWhere = joParamWhere.nmContent ? `and c.nmContent ilike ${joParamWhere.nmContent} ` : ""
			const dsContentWhere = joParamWhere.dsContent ? `and c.dsContent ilike ${joParamWhere.dsContent} ` : ""
			const nmChannelWhere = joParamWhere.nmChannel ? `and ch.nmChannel ilike ${joParamWhere.nmChannel} ` : ""
			const dsChannelWhere = joParamWhere.dsChannel ? `and ch.dsChannel ilike ${joParamWhere.dsChannel} ` : ""
			const nmCtContentWhere = joParamWhere.nmCtContent ? `and ctc.nmCtContent ilike ${joParamWhere.nmCtContent} ` : ""
			const nmPublisherWhere = joParamWhere.nmPublisher ? `and uPublisher.nmUser ilike ${joParamWhere.nmPublisher} ` : ""
			const nmTagWhere = joParamWhere.nmTag ? `and t.nmTag ilike ${joParamWhere.nmTag} ` : ""
			const nmGroupWhere = joParamWhere.nmGroup ? `and g.nmGroup ilike ${joParamWhere.nmGroup} ` : ""
			dsWhereString = `
		${nmContentWhere}
		${dsContentWhere}
		${nmChannelWhere}
		${dsChannelWhere}
		${nmCtContentWhere}
		${nmPublisherWhere}
		${nmTagWhere}
		${nmGroupWhere}
			`
		}
		return dsWhereString
	}

	public getSort(joParam: { idUserScope?: number, nmSort?: string, isSelectQuoted?: boolean }): string {
		let dsSortConditions = ""
		const isSelectQuoted = LayerDao.isSelectQuoted(joParam, true)
		const nmTable = isSelectQuoted ? "" : "c"
		if (joParam.idUserScope && (joParam.nmSort == "qtViewUser" || joParam.nmSort == undefined)) {
			dsSortConditions += ` uc.qtView asc NULLS FIRST, ${DaoUtil.getCsNmField(["dhUpdate"], nmTable, isSelectQuoted)} asc `
		}

		dsSortConditions += joParam.nmSort == "keyCtContentState" ?
			`${DaoUtil.getCsNmField(["keyCtContentState"], nmTable, isSelectQuoted)} asc NULLS LAST` : ""
		dsSortConditions += joParam.nmSort == "vlEval" ?
			`${DaoUtil.getCsNmField(["vlEval"], nmTable, isSelectQuoted)} desc NULLS LAST` : ""
		dsSortConditions += joParam.nmSort == "nmContent" ?
			`${DaoUtil.getCsNmField(["nmContent"], nmTable, isSelectQuoted)} asc` : ""
		dsSortConditions += joParam.nmSort == "dhPublish" ?
			`${DaoUtil.getCsNmField(["dhPublish"], nmTable, isSelectQuoted)} desc` : ""
		dsSortConditions += joParam.nmSort == "dhUpdate" ?
			`${DaoUtil.getCsNmField(["dhUpdate"], nmTable, isSelectQuoted)} desc` : ""
		dsSortConditions += joParam.nmSort == "dhLastConversion" ?
			`${DaoUtil.getCsNmField(["dhLastConversion"], nmTable, isSelectQuoted)} desc nulls last` : ""
		dsSortConditions += joParam.nmSort == undefined && !joParam.idUserScope ?
			`${DaoUtil.getCsNmField(["dhPublish"], nmTable, isSelectQuoted)} asc` : ""
		const dsSort = dsSortConditions != "" ? `order by ${dsSortConditions}` : ""
		return dsSort
	}

	public getGroupBy(joParam: IContentDaoParam): string {
		if (!joParam.idUserScope) {
			return ""
		}
		const isSelectQuoted = LayerDao.isSelectQuoted(joParam)
		const nmTableC = isSelectQuoted ? "" : "c"
		const dsLkContentGroupBy = joParam.hasLink ? `${DaoUtil.getCsNmField(["lkContent"], "", isSelectQuoted)}, ` : ""
		const dsIdUserScopeGroupBy = joParam.idUserScope ? `${DaoUtil.getCsNmField(["qtView", "isFavorite"], "uc")}, ` +
			`${DaoUtil.getCsNmField(
				["isLike", "dhLastConversion", "dhLastView", "vlEvalUser"], "", isSelectQuoted)}` : ""
		const arNmFieldContentGroupByFix = Content.getArNmFieldPublic().filter((nmField) => nmField != "vlSort")
		const dsContentGroupBy = `${DaoUtil.getCsNmField(arNmFieldContentGroupByFix, nmTableC, isSelectQuoted)}, `
		const dsTranslatedGroupBy = `${DaoUtil.getCsNmField(["nmCtContent", "nmPublisher"], "", isSelectQuoted)}, `
		const dsUntranslatedGroupBy = `${DaoUtil.getCsNmField(["vlSort"], "c", LayerDao.isSelectQuoted(joParam, false))}, `

		const dsGroupBy = `group by
			${dsContentGroupBy} ${dsTranslatedGroupBy} ${dsUntranslatedGroupBy} ${dsLkContentGroupBy} ${dsIdUserScopeGroupBy}`

		return dsGroupBy
	}

	public static getSelectCaseCtContentState(joParam: { isSelectQuoted?: boolean }): string {
		const isSelectQuoted = LayerDao.isSelectQuoted(joParam)
		const dsField = `${DaoUtil.getCsNmField(["keyCtContentState"], "", isSelectQuoted)}`
		const selectCaseCtContentState = `
			case when ((uc.qtView is null or uc.qtView = 0) and uc.dhLastConversion is null) then ${CtCardState.notViewed.key}
			when (uc.qtView > 0 and uc.dhLastConversion is null) then ${CtCardState.notConverted.key}
			when (uc.dhLastConversion < c.dhUpdate) then ${CtCardState.notConvertedUpdate.key}
			else ${CtCardState.allConverted.key} end as ${dsField}`
		return selectCaseCtContentState
	}
}
