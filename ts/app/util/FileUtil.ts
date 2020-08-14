import { Request, Response } from "express"
import * as S3 from 'aws-sdk/clients/s3'
import { Env } from "app/structure/Env"
import { HExcep } from "app/util/status/HExcep"
import { CtExcep, CtError, KeyEnum } from "salesfy-shared"
import { HError } from "app/util/status/HError"
const requestJs = require('request')

export class FileUtil {

	public static toJoFile(nmFile: string, lkFile: string): any {
		const joFile = { lkFile: lkFile, nmFile: nmFile }
		return joFile
	}

	public static async getWebFile(lkFile: string): Promise<any> {
		const options = {
			uri: lkFile,
			encoding: null
		}

		return new Promise<any>(async (resolve, reject) => {
			try {
				requestJs(options, (err: any, res2: Response, body: any) => {
					try {
						if (err) {
							throw new HError({ ctStatus: CtError.somethingWentWrong, dsConsole: err })
						}
						if (res2.statusCode !== 200) {
							throw new HExcep({ ctStatus: CtExcep.nmKeyNotFound, joExtraContent: { nmKey: KeyEnum.link } })
						}
						resolve(body)
						return body
					} catch (err) {
						resolve()
						return
					}
				})
			} catch (err) {
				resolve()
				return
			}
		})
	}

	public static async uploadToS3(nmFile: string, obFile: any) : Promise<void>{
		const s3 = new S3({ apiVersion: Env.getS3NmApiVersion() })

		const joParam = {
			Body: obFile,
			Key: nmFile,
			Bucket: Env.getS3NmBucket() + "/" + Env.getS3NmContentDir()
		}

		return new Promise<any>(async (resolve, reject) => {
			try {
				s3.putObject(joParam, (err: any, data: any) => {
					try {
						if (err) {
							throw new HError({ ctStatus: CtError.somethingWentWrong, dsConsole: err })
						} else {
							resolve(data)
							return data
						}
					} catch (err) {
						resolve()
						return
					}
				})
			} catch (err) {
				resolve()
				return
			}
		})
	}

	public static async removeFromS3(nmFile: string) : Promise<void> {
		const s3 = new S3({ apiVersion: Env.getS3NmApiVersion() })

		const joParam = {
			Key: nmFile,
			Bucket: Env.getS3NmBucket() + "/" + Env.getS3NmContentDir()
		}

		return new Promise<any>(async (resolve, reject) => {
			try {
				s3.deleteObject(joParam, (err: any, data: any) => {
					try {
						if (err) {
							throw new HError({ ctStatus: CtError.somethingWentWrong, dsConsole: err })
						} else {
							resolve(data)
							return data
						}
					} catch (err) {
						resolve()
						return
					}
				})
			} catch (err) {
				resolve()
				return
			}
		})
	}

	public static async getS3AcceptableFormat(joParam: any): Promise<any> {
		if (joParam.lkFile) {
			const blFile = await FileUtil.getWebFile(joParam.lkFile)
			return blFile
		}
		if (joParam.b64File) {
			const bfFile = await FileUtil.toBuffer(joParam.b64File)
			return bfFile
		}
		if (joParam.blFile) {
			return joParam.blFile
		}
		if (joParam.bfFile) {
			return joParam.bfFile
		}
		return
	}

	public static toBuffer (b64File:string) : any {
		const b64FileCode = b64File.split('base64,').pop()
		if (!b64FileCode) {
			return
		}
		const buffer = Buffer.from(b64FileCode, 'base64')
		return buffer
	}
}
