import { Application } from "express";
import { UserRte } from "./../../modules/user/UserRte";
import { AuthRte } from "../../modules/auth/AuthRte";
import { ContentRte } from "../../modules/content/ContentRte";
import { UserContentRte } from "../../modules/user_content/UserContentRte";
import { BaseRte } from "../../modules/base/BaseRte";
import { ChannelRte } from "app/modules/channel/ChannelRte";
import { NotifyMsgRte } from "app/modules/notify_msg/NotifyMsgRte";
import { TagRte } from "app/modules/tag/TagRte";
import { UserTagRte } from "app/modules/user_tag/UserTagRte";
import { ContactRte } from "app/modules/contact/ContactRte";
import { GroupRte } from "app/modules/group/GroupRte";
import { LayerRoutes } from "app/layers_template/LayerRoutes";
import { UserGroupRte } from "app/modules/user_group/UserGroupRte";
import { InviteRte } from "app/modules/invite/InviteRte";
import { ChannelGroupRte } from "app/modules/channel_group/ChannelGroupRte";
import { ContentChannelRte } from "app/modules/content_channel/ContentChannelRte";
import { EnvReloadRte } from "app/modules/env_reload/EnvReloadRte";
import { FileRte } from "app/modules/file/FileRte";
import { PreviewRte } from "app/modules/preview/PreviewRte";
import { WorkspaceRte } from "app/modules/workspace/WorkspaceRte";

export class RoutesLoader {
	public static load(app: Application) {
		const routesClass : any[] = [
			UserRte,
			AuthRte,
			ContentRte,
			ChannelRte,
			UserContentRte,
			NotifyMsgRte,
			TagRte,
			UserTagRte,
			ContactRte,
			GroupRte,
			UserGroupRte,
			InviteRte,
			ChannelGroupRte,
			ContentChannelRte,
			EnvReloadRte,
			FileRte,
			PreviewRte,
			WorkspaceRte,
			BaseRte //should be the last
		]
		RoutesLoader.newIt(app, routesClass)
	}

	private static newIt(app: Application, routesClass : LayerRoutes[]) {
		routesClass.forEach(routeClass => {
			const routeClassAny : any = routeClass
			const routeInstance = new routeClassAny(app)
		});
	}
}
