import { should } from "chai"
import { describe } from "mocha"
import * as supertest from 'supertest'
import { Done } from 'mocha'
import { Response } from "superagent";

// import { KeyEnum, RoutesEnum, SConst, THttpMethod, StringUtil } from "salesfy-shared";

import { Log } from "../../app/structure/Log";
import { DbConn } from "../../app/structure/DbConn";
import { Env } from "../../app/structure/Env";
import { HEmail } from "../../app/structure/HEmail";
import { Server } from "../../app/structure/Server";

import { TestUser } from "./../support/TestUser.spec"
import { TestConfig } from "./../support/TestConfig.spec"
import { TestCaseItem } from "./../support/TestCaseItem.spec"
import { TestShould } from "./../support/TestShould.spec"
import { TestUserManager } from "./../support/TestUserManager.spec"
import { TestUtil } from "./../support/TestUtil.spec"

export { should, describe, supertest, Done, Response }
// export { KeyEnum, RoutesEnum, SConst, THttpMethod, StringUtil }
export { Log, DbConn, Env, HEmail, Server }
export { TestUser, TestCaseItem,TestShould, TestConfig, TestUserManager, TestUtil }
