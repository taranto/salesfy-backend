import './ModuleAlias';
import { Server } from './app/structure/Server';
require("source-map-support").install();
Server.start(() => { })
