import './ModuleAlias';
import { TestConfig } from "./test/barrel/Barrel.spec";
import { BaseRteSpec } from "./test/modules/BaseRte.spec";
import { ArchitectureSpec, AuthMailRteSpec, TestingSpec, HMailSpec } from "./test/barrel/BarrelSpec.spec";
import { AuthRteSpec, ContentRteSpec, UserContentRteSpec } from "./test/barrel/BarrelSpec.spec";
import { ChannelRteSpec } from './test/modules/channel/ChannelRte.spec';
import { NotifyMsgRteSpec } from './test/modules/notify_msg/NotifyMsgRte.spec';
import { TagRteSpec } from './test/modules/tag/TagRte.spec';
import { UserTagRteSpec } from './test/modules/tag/UserTagRte.spec';
import { ContactRteSpec } from './test/modules/contact/ContactRte.spec';
import { TokenSpec } from './test/behavior/Token.spec';
import { ChannelContentsAccessedSpec } from './test/behavior/ChannelContentsAccessed.spec';
import { GroupScopeForContentsSpec } from './test/behavior/GroupScopeForContents.spec';
import { GroupScopeForChannelsSpec } from './test/behavior/GroupScopeForChannels.spec';
import { GroupRteSpec } from './test/modules/group/GroupRte.spec';
import { UserGroupRteSpec } from './test/modules/group/UserGroupRte.spec';
import { UserRteSpec } from './test/modules/user/UserRteSpec.spec';
import { ChannelFuncRteSpec } from './test/modules/channel/ChannelFuncRte.spec';
import { ChannelGroupRteSpec } from './test/modules/channel/ChannelGroupRte.spec';
import { QuickRteSpec } from './test/modules/QuickRte.spec';
import { ContentChannelRteSpec } from './test/modules/content/ContentChannelRte.spec';
import { UserPermissionSpec } from './test/behavior/UserPermission.spec';
import { ChannelGroupFuncRteSpec } from './test/modules/channel/ChannelGroupFuncRte.spec';
import { InviteRteSpec } from './test/modules/invite/InviteRte.spec';
import { ContentViewedParallel } from './test/behavior/ContentViewedParallel.spec';
import { ChannelFilterRteSpec } from './test/modules/channel/ChannelFilterRte.spec';
import { ContentFilterRteSpec } from './test/modules/content/ContentFilterRte.spec';
import { ContentSortRteSpec } from './test/modules/content/ContentSortRte.spec';
import { ChannelStoriesRteSpec } from './test/modules/channel/ChannelStoriesRte.spec';
import { FileRteSpec } from './test/modules/file/FileRte.spec';
import { ChannelSortRteSpec } from './test/modules/channel/ChannelSortRte.spec';
import { PreviewRteSpec } from './test/modules/preview/PreviewRte.spec';
import { WorkspaceRteSpec } from './test/modules/workspace/WorkspaceRte.spec';
import { WorkspaceGroupRteSpec } from './test/modules/workspace/WorkspaceGroupRte.spec';
import { WorkspaceUserRteSpec } from './test/modules/workspace/WorkspaceUserRte.spec';
import { EnvTest } from './test/support/EnvTest.spec';
import { WorkspaceItemsAccess } from './test/behavior/WorkspaceItemsAccess.spec';
import { BulkSpec } from './test/architecture/Bulk.spec';
import { UserGroupReaderAccess } from './test/behavior/UserGroupReaderAccess.spec';

require("source-map-support").install()

TestConfig.beforeAllTest()

describe("Salesfy test @all", () => {
	TestingSpec.test()
	if (EnvTest.getShDoTest()) {
		const quickRteSpec = new QuickRteSpec()
		quickRteSpec.test()

		describe("Salesfy test @routes", () => {
			BaseRteSpec.test()
			AuthRteSpec.test()
			const userRteSpec = new UserRteSpec()
			userRteSpec.test()
			AuthMailRteSpec.test()
			ContentRteSpec.test()
			ChannelRteSpec.test()
			const channelFilterRteSpec = new ChannelFilterRteSpec()
			channelFilterRteSpec.test()
			const contentFilterRteSpec = new ContentFilterRteSpec()
			contentFilterRteSpec.test()
			const contentSortRteSpec = new ContentSortRteSpec()
			contentSortRteSpec.test()
			const channelSortRteSpec = new ChannelSortRteSpec()
			channelSortRteSpec.test()
			const channelStoriesRteSpec = new ChannelStoriesRteSpec()
			channelStoriesRteSpec.test()
			ChannelFuncRteSpec.test()
			const userContentRteSpec = new UserContentRteSpec()
			userContentRteSpec.test()
			NotifyMsgRteSpec.test()
			TagRteSpec.test()
			UserTagRteSpec.test()
			ContactRteSpec.test()
			GroupRteSpec.test()
			const userGroupRteSpec = new UserGroupRteSpec()
			userGroupRteSpec.test()
			InviteRteSpec.test()
			const channelGroupRteSpec = new ChannelGroupRteSpec()
			channelGroupRteSpec.test()
			ChannelGroupFuncRteSpec.test()
			const contentChannelRteSpec = new ContentChannelRteSpec()
			contentChannelRteSpec.test()
			const fileRteSpec = new FileRteSpec()
			fileRteSpec.test()
			const previewRteSpec = new PreviewRteSpec()
			previewRteSpec.test()
			const workspaceRteSpec = new WorkspaceRteSpec()
			workspaceRteSpec.test()
		})

		describe("Salesfy test @behaviour", () => {
			TokenSpec.test()
			const channelContentsAccessedSpec = new ChannelContentsAccessedSpec()
			channelContentsAccessedSpec.test()
			GroupScopeForChannelsSpec.test()
			GroupScopeForContentsSpec.test()
			UserPermissionSpec.test()
			ContentViewedParallel.test()
			const workspaceItemsAccess = new WorkspaceItemsAccess()
			workspaceItemsAccess.test()
			const userGroupReaderAccess = new UserGroupReaderAccess()
			userGroupReaderAccess.test()
		})

		describe("Salesfy test @business", () => {
		})

		describe("Salesfy test @util", () => {
		})

		describe("Salesfy test @architecture", () => {
			ArchitectureSpec.test()
			HMailSpec.test()
			const bulkSpec = new BulkSpec()
			bulkSpec.test()
		})
	}
})

TestConfig.afterAllTest()
