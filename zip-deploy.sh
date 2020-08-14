#!/bin/bash
#
#	This command will zip up the contents of this project, and place the zip file on the Backend dir
#
LOCATION=./
PROJECT=backend-salesfy

# Find the next version number
cnt=1
while true ; do
	filename=${LOCATION}/${PROJECT}-${cnt}.zip
	[ ! -r ${filename} ] && break;
	cnt=`expr $cnt + 1`
done
echo Creating file ${filename}

# Now zip up the file
zip -r -X ${filename} \
	.ebextensions/ \
	.elasticbeanstalk/ \
	.npmrc \
	ts/app/ \
	ts/EntryPoint.ts \
	ts/ModuleAlias.ts \
	package.json \
	package-lock.json \
	sequelizeconfig.json \
	tsconfig.json \
	tsconfig.server.json \
	tslint.json \
	yarn.lock \
	salesfy-shared/ts/ \
	salesfy-shared/.npmrc \
	salesfy-shared/package.json \
	salesfy-shared/package-lock.json \
	salesfy-shared/tsconfig.json \
	salesfy-shared/tsconfig.shared.json \
	salesfy-shared/tsconfig.test.json \
	salesfy-shared/tslint.json
status=$?

# Exit with the same status as the zip command
exit $status