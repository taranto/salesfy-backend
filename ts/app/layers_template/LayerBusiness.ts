import { Transaction } from './../structure/DbConn'
import { IEntity, KeyEnum, CtError, CtWarn } from 'salesfy-shared';
import { LayerDao } from 'app/layers_template/LayerDao';
import { HExcep } from 'app/util/status/HExcep';
import { Model } from 'sequelize-typescript';
import { LayerEntity } from 'app/layers_template/LayerEntity';
import { ValUtil } from 'app/util/ValUtil';

export abstract class LayerBusiness {

	protected t: Transaction

	constructor(t: Transaction) {
		this.t = t
	}

	public async getMxMEntity(joParam: { idUserScope: number, idBase: number, nmIdBase : string,
		idEntity1: number, nmIdEntity1:string, idEntity2: number, nmIdEntity2:string },
		dao: LayerDao<any,IEntity>): Promise<IEntity[]> {
		const joParamAny : any  = joParam
		if (joParam.idBase) {
			const arEntity = await this.getById(joParam, dao)
			return arEntity
		}
		if (joParam.idEntity1 && joParam.idEntity2) {
			const arEntity = await this.getByFks(joParam, dao)
			return arEntity
		}
		throw new HExcep({ctStatus:CtError.parametersAreMissing})
	}

	public async getByFks(joParam: { idUserScope: number; idEntity1: number; nmIdEntity1: string;
		idEntity2: number; nmIdEntity2: string; }, dao: LayerDao<any,IEntity>) : Promise<IEntity[]> {
		if (joParam.idEntity1 && joParam.idEntity2) {
			const joParamGet: any = {}
			joParamGet[joParam.nmIdEntity1] = joParam.idEntity1
			joParamGet[joParam.nmIdEntity2] = joParam.idEntity2
			const arEntity = await dao.get(joParamGet)
			return arEntity
		}
		throw new HExcep({ctStatus:CtError.parametersAreMissing})
	}

	public async getById(joParam: { idUserScope: number; idBase: number; nmIdBase: string }, dao: LayerDao<any,IEntity>)
		: Promise<IEntity[]>  {
		if (joParam.idBase) {
			const joParamGet: any = {}
			joParamGet[joParam.nmIdBase] = joParam.idBase
			const arEntity = await dao.get(joParamGet)
			return arEntity
		}
		throw new HExcep({ctStatus:CtError.parametersAreMissing})
	}

	public relinkJoParamValKeysGeneric(joParam: any, ...arArNmKeyOneRequired:string[][]) : void {
		let isAllMissing = true
		arArNmKeyOneRequired.forEach(arNmKeyRequired => {
			isAllMissing = isAllMissing && !ValUtil.isArNmKeyMissingInJoParam(joParam, "idUserScope", ...arNmKeyRequired)
		})
		if (isAllMissing) {
			throw new HExcep({
				ctStatus: CtWarn.nmKeyRequired,
				joExtraContent: { nmKey: arArNmKeyOneRequired.join(", "), count: arArNmKeyOneRequired.length }
			})
		}
	}
}
