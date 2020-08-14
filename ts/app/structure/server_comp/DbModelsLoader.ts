import { Model, Sequelize } from "sequelize-typescript";
import { User } from "./../../modules/user/User";
import { Content } from "../../modules/content/Content";
import { UserContent } from "../../modules/user_content/UserContent";
import { EmailFailure } from "../../modules/email_failure/EmailFailure";
import { Channel } from "app/modules/channel/Channel";
import { NotifyMsg } from "app/modules/notify_msg/NotifyMsg";
import { Tag } from "app/modules/tag/Tag";
import { UserTag } from "app/modules/user_tag/UserTag";
import { UserChannel } from "app/modules/user_channel/UserChannel";
import { Group } from "app/modules/group/Group";
import { UserGroup } from "app/modules/user_group/UserGroup";
import { ChannelGroup } from "app/modules/channel_group/ChannelGroup";
import { ContentChannel } from "app/modules/content_channel/ContentChannel";
import { UserPermission } from "app/modules/user/UserPermission";
import { Workspace } from "app/modules/workspace/Workspace";
import { LocalStorage } from "app/modules/local_storage/LocalStorage";

export class EntityLoader {
	public static addModels(sq: Sequelize, models: Array<typeof Model>): void {
		sq.addModels(models);
	}

	public static load(sq: Sequelize) {
		EntityLoader.addModels(sq, [User, Content, UserContent, EmailFailure, Channel, NotifyMsg, Tag, UserTag,
			UserChannel, Group, UserGroup, ChannelGroup, ContentChannel, UserPermission, Workspace, LocalStorage])
	}
}
