
CREATE TABLE public.usr (
	iduser serial NOT NULL,
	nmuser varchar(60) NOT NULL,
	nmlogin varchar(30) NOT NULL,
	pwloginencrypted varchar(61) NULL,
	pwrefreshtoken varchar(61) NULL,
	dsemail varchar(120) NOT NULL,
	dtregister timestamp NOT NULL DEFAULT 'now'::text::date,
	nrtelephone varchar(20) NULL,
	nrwhatsapp varchar(20) NULL,
	piavatar text NULL,
	nmcompany varchar(50) NULL,
	nmcargo varchar(50) NULL,
	lkfacebook text NULL,
	lklinkedin text NULL,
	dstestimony text NULL,
	lkwebsite text NULL,
	pwresetpasswordkey varchar(255) NULL,
	dtresetpasswordkeyexpiration timestamp NULL,
	pwemailconfirmationkey varchar(255) NULL,
	isemailconfirmed bool NULL DEFAULT false,
	vllanguage int2 NULL DEFAULT 0,
	CONSTRAINT usr_nmlogin_key UNIQUE (nmlogin),
	CONSTRAINT usr_pkey PRIMARY KEY (iduser)
)
WITH (
	OIDS=FALSE
) ;
ALTER TABLE public.usr OWNER TO postgres;

CREATE TABLE public.author (
	idauthor serial NOT NULL,
	nmauthor text NULL,
	lkwebsite text NULL,
	piavatar text NULL,
	dstestimony text NULL,
	CONSTRAINT author_pkey PRIMARY KEY (idauthor)
);
ALTER TABLE public.author OWNER TO postgres;

CREATE TABLE public.author_data (
	idauthor int4 NULL,
	nmauthor text NULL,
	lkwebsite text NULL,
	piavatar text NULL,
	dstestimony text NULL
)
WITH (
	OIDS=FALSE
) ;
ALTER TABLE public.author_data OWNER TO postgres;

CREATE TABLE public.channel (
	idchannel serial NOT NULL,
	nmchannel text NOT NULL,
	pichannel text NOT NULL,
	nrorderchannel int4 NULL,
	CONSTRAINT channel_pkey PRIMARY KEY (idchannel)
)
WITH (
	OIDS=FALSE
) ;
ALTER TABLE public.channel OWNER TO postgres;

CREATE TABLE public.channel_data (
	idchannel int4 NULL,
	nmchannel text NULL,
	pichannel text NULL,
	nrorderchannel int4 NULL
)
WITH (
	OIDS=FALSE
) ;
ALTER TABLE public.channel_data OWNER TO postgres;

CREATE TABLE public.content (
	idcontent serial NOT NULL,
	nmcontent varchar(255) NOT NULL,
	picontent text NOT NULL,
	dscontent text NULL,
	ctcontent int2 NOT NULL,
	lkcontent text NULL,
	qtlike int2 NULL,
	qtfavorite int2 NULL,
	qtview int2 NULL,
	qtconversion int2 NULL,
	iduserauthor int4 NOT NULL,
	showdescription bool NULL DEFAULT true,
	showtitle bool NULL DEFAULT true,
	isfullscreenimage bool NULL DEFAULT false,
	showactionbuttons bool NULL DEFAULT true,
	showauthor bool NULL DEFAULT true,
	CONSTRAINT content_pkey PRIMARY KEY (idcontent)
)
WITH (
	OIDS=FALSE
) ;
ALTER TABLE public.content OWNER TO postgres;

CREATE TABLE public.content_data (
	idcontent int4 NULL,
	nmcontent text NULL,
	ctcontent text NULL,
	lkcontent text NULL,
	idauthor text NULL,
	dscontent text NULL,
	picontent text NULL,
	tag1 text NULL,
	tag2 text NULL,
	tag3 text NULL,
	tag4 text NULL,
	tag5 text NULL,
	idtemplate text NULL
)
WITH (
	OIDS=FALSE
) ;
ALTER TABLE public.content_data OWNER TO postgres;
CREATE TABLE public.contentchannel (
	idcontentchannel serial NOT NULL,
	idchannel int4 NOT NULL,
	idcontent int4 NOT NULL,
	nrordercontent int2 NOT NULL,
	CONSTRAINT contentchannel_pkey PRIMARY KEY (idcontentchannel)
)
WITH (
	OIDS=FALSE
) ;
ALTER TABLE public.contentchannel OWNER TO postgres;

CREATE TABLE public.contentchannel_data (
	idchannel text NULL,
	idcontent text NULL,
	nrordercontent text NULL
)
WITH (
	OIDS=FALSE
) ;
ALTER TABLE public.contentchannel_data OWNER TO postgres;

CREATE TABLE public.tag (
	idtag serial NOT NULL,
	nmtag text NOT NULL,
	vlpriority int2 NOT NULL,
	ishidden bool NOT NULL DEFAULT false,
	CONSTRAINT tag_pkey PRIMARY KEY (idtag)
)
WITH (
	OIDS=FALSE
) ;
ALTER TABLE public.tag OWNER TO postgres;


CREATE TABLE public.contenttag (
	idcontenttag serial NOT NULL,
	idcontent int4 NOT NULL,
	idtag int2 NOT NULL,
	CONSTRAINT contenttag_pkey PRIMARY KEY (idcontenttag),
	CONSTRAINT idcontent_contenttag_content FOREIGN KEY (idcontent) REFERENCES content(idcontent),
	CONSTRAINT idtag_contenttag_tag FOREIGN KEY (idtag) REFERENCES tag(idtag)
)
WITH (
	OIDS=FALSE
) ;
ALTER TABLE public.contenttag OWNER TO postgres;

CREATE TABLE public.ctcontent (
	idctcontent serial NOT NULL,
	nmctcontent text NOT NULL,
	CONSTRAINT ctcontent_pkey PRIMARY KEY (idctcontent)
)
WITH (
	OIDS=FALSE
) ;
ALTER TABLE public.ctcontent OWNER TO postgres;

CREATE TABLE public.ctcontent_data (
	idctcontent int4 NULL,
	nmctcontent text NULL
)
WITH (
	OIDS=FALSE
) ;
ALTER TABLE public.ctcontent_data OWNER TO postgres;

CREATE TABLE public.emailfailure (
	idemailfailure serial NOT NULL,
	dsemailto varchar(120) NOT NULL,
	dsemailfrom varchar(120) NOT NULL,
	dsemailhtml text NOT NULL,
	dsemailsubject text NOT NULL,
	cderrorresponse int4 NOT NULL,
	dserrorstack text NOT NULL,
	dhfailure timestamp NOT NULL,
	qtretry int2 NOT NULL DEFAULT 0,
	issent bool NOT NULL DEFAULT false,
	dhlastretry timestamp NULL,
	CONSTRAINT emailfailure_pkey PRIMARY KEY (idemailfailure)
)
WITH (
	OIDS=FALSE
) ;
ALTER TABLE public.emailfailure OWNER TO postgres;

CREATE TABLE public.usercontentinteraction (
	idusercontentinteraction serial NOT NULL,
	iduser int4 NOT NULL,
	idcontent int2 NOT NULL,
	islike bool NULL DEFAULT false,
	isfavorite bool NULL DEFAULT false,
	qtview int2 NULL DEFAULT 0,
	qtconversion int2 NOT NULL DEFAULT 0,
	CONSTRAINT usercontentinteraction_pkey PRIMARY KEY (idusercontentinteraction),
	CONSTRAINT idcontent_content_usercontentinteraction FOREIGN KEY (idcontent) REFERENCES content(idcontent),
	CONSTRAINT iduser_usercontentinteraction_user FOREIGN KEY (iduser) REFERENCES usr(iduser)
)
WITH (
	OIDS=FALSE
) ;
ALTER TABLE public.usercontentinteraction OWNER TO postgres;
-----------------------------------------
--(Taranto, 23/09/2018. Dev-012 backend) *executado

ALTER TABLE contentChannel ALTER COLUMN nrOrderContent TYPE smallint using nrordercontent::smallint;
alter table usercontentinteraction alter column qtview set default 0;
alter table usercontentinteraction alter column qtview set not null;
alter table usercontentinteraction alter column qtconversion set default 0;
-----------------------------------------
--(Taranto, 24/09/2018. Dev-013 backend) *executado
alter table author add column idUser integer;
alter table author add CONSTRAINT iduser_user_author FOREIGN KEY (iduser) REFERENCES usr(iduser);
-----------------------------------------
--(Taranto, 29/09/2018. Dev-013 backend) *executado
ALTER TABLE usr ADD CONSTRAINT usr_dsemail_unique UNIQUE (dsEmail);
-----------------------------------------
--(Taranto, 03/10/2018. Dev-014 backend) *executado
create table NotifyMsg (
	idnotifymsg serial primary key not null,
	nrVersionMax varchar(20) not null,
	nrVersionMin varchar(20) not null,
	shShowSysAndroid boolean not null,
	shShowSysIPhone boolean not null,
	ctKeyMsg text,
	dsMsgRawEn text,
	dsMsgRawPt text,
	isBlockable boolean not null,
	isUpdatable boolean not null,
	miStart timestamp,
	miEnd timestamp
);  ALTER TABLE NotifyMsg OWNER TO postgres;

alter table usr add column miLastAccess timestamp ;
------------------------------------------
--(Taranto, 15/10/2018. Dev-015 backend) *executado

alter table author rename to producer;
alter table producer rename column idauthor to idproducer;
alter table producer rename column nmAuthor to nmproducer;

alter table usr rename column dsemail to emuser;
alter table usr rename column pwLoginEncrypted to crKeyPassword;
alter table usr rename column pwRefreshToken to crKeyRefreshToken;
alter table usr rename column pwResetPasswordKey to crKeyResetPassword;
alter table usr rename column pwEmailConfirmationKey to crKeyEmailConfirmation;
alter table usr rename column vlLanguage to cdLanguage;
alter table usr rename column dtRegister to dhRegister;
alter table usr rename column miLastAccess to dhLastAccess;
alter table usr rename column nrTelephone to snTelephone;
alter table usr rename column nrWhatsapp to snWhatsapp;
alter table usr rename column dtResetPasswordKeyExpiration to dhKeyResetPasswordExpiration;

alter table content rename column idUserAuthor to idProducer;
alter table content rename column showDescription to shShowDescription;
alter table content rename column showTitle to shShowTitle;
alter table content rename column isFullscreenImage to shShowFullscreenImage;
alter table content rename column showActionButtons to shShowActionButtons;
alter table content rename column showAuthor to shShowProducer;
alter table content rename column ctContent to idCtContent;

alter table contentChannel rename column nrOrderContent to vlSort;
alter table channel rename column nrOrderChannel to vlSort;

alter table EmailFailure rename column dsEmailTo to emTo;
alter table EmailFailure rename column dsEmailFrom to emFrom;
alter table EmailFailure rename column dsEmailHtml to dsHtml;
alter table EmailFailure rename column dsEmailSubject to dsSubject;

alter table NotifyMsg rename column ctKeyMsg to keyMsg;
alter table NotifyMsg rename column miEnd to dhEnd;
alter table NotifyMsg rename column miStart to dhStart;
alter table NotifyMsg rename column nrVersionMax to snVersionMax;
alter table NotifyMsg rename column nrVersionMin to snVersionMin;

------------------------------------------
--(Taranto, 22/10/2018. Dev-015 backend) *executado

alter table content add column shShowShortCard boolean default false not null;
------------------------------------------
--(Taranto, 25/10/2018. Dev-015 backend) *executado

alter table usr drop column nmLogin;
alter table usr drop column nmuser;
------------------------------------------
--(Taranto, 30/10/2018. Dev-015 backend) *executado
alter table usr rename column cdLanguage to nrLanguage;
------------------------------------------
--(Taranto, 14/11/2018. Dev-016 backend) *executado
--select setval((select pg_get_serial_sequence('content', 'idcontent')), (select max(idcontent) from content))
select setval((select pg_get_serial_sequence('content', 'idcontent')), 1000000);
alter table content add column shCurate boolean default true not null;
update content set shCurate = false; --sim, sem where mesmo.

alter table content alter column qtlike set default 0;
alter table content alter column qtfavorite set default 0;
alter table content alter column qtview set default 0;
alter table content alter column qtconversion set default 0;

alter table content alter column qtlike set not null;
alter table content alter column qtfavorite set not null;
alter table content alter column qtview set not null;
alter table content alter column qtconversion set not null;
------------------------------------------
--(Taranto, 20/11/2018. Dev-017 backend) *executado
alter table content drop column shcurate;
alter table channel add column isAward boolean default null;
alter table channel_data add column isAward boolean default null;

--select setval((select pg_get_serial_sequence('producer', 'idproducer')), (select max(idproducer) from producer))
select setval((select pg_get_serial_sequence('producer', 'idproducer')), 100000);
------------------------------------------
--(Taranto, 27/11/2018. Dev-017 backend) *executado
alter table content alter column nmContent drop not null;
------------------------------------------
--(Taranto, 28/11/2018. Dev-017 backend) *executado
alter table userContentInteraction ALTER COLUMN idContent SET DATA TYPE integer;
------------------------------------------
--(Taranto, 29/11/2018. Dev-017 backend) *executado
update producer set nmproducer = (select split_part(emuser, '@', 1) from usr join producer p using(iduser) where p.iduser = producer.iduser) where nmproducer is null;
------------------------------------------
--(Taranto, 04/12/2018. Dev-018 backend) *executado
alter table usr alter column crkeypassword drop not null;
alter table usr add column nmuser varchar(63);
------------------------------------------
--(Taranto, 05/12/2018. Dev-018 backend) *executado
create table userTag (
	idUserTag serial not null,
	idTag int4 not null,
	idUser int4 not null,
	CONSTRAINT idTag_idUser_unique_key UNIQUE (idTag, idUser),
	CONSTRAINT idusertag_pkey PRIMARY KEY (idUserTag)
)
WITH (
	OIDS=FALSE
) ;
ALTER TABLE userTag OWNER TO postgres;
------------------------------------------
--(Taranto, 12/12/2018. Dev-018 backend) *executado
alter table channel add column isPlaybook boolean default null;
------------------------------------------
--(Taranto, 14/12/2018. Dev-018 backend) *executado
alter table usr add column keyFacebook text default null;
alter table usr add column keyGoogle text default null;
------------------------------------------
--(Taranto, 18/12/2018. Dev-018 backend) *executado
alter table content_data add column isShareable boolean;
alter table content add column shShowShareButton boolean;
alter table channel_data add column isPlaybook boolean;
ALTER TABLE contenttag DROP CONSTRAINT idcontent_contenttag_content;
------------------------------------------
--(Taranto, 27/12/2018. Dev-018 backend) *executado
alter table tag drop column ishidden;

CREATE TABLE public.tag_data (
	idtag serial NOT NULL,
	nmtag text NOT NULL,
	idCtTag int2 NOT NULL,
	lkTag text
)
WITH (
	OIDS=FALSE
) ;
ALTER TABLE public.tag_data OWNER TO postgres;

alter table content_data drop column tag1;
alter table content_data drop column tag2;
alter table content_data drop column tag3;
alter table content_data drop column tag4;
alter table content_data drop column tag5;

alter table content_data add column idCtAudience text;
alter table content_data add column idCtNiche text;
alter table content_data add column idCtSubject1 text;
alter table content_data add column idCtSubject2 text;
alter table content_data add column idCtSubject3 text;
alter table content_data add column vlQualification smallint;

alter table content add column vlSort int;

alter table tag add column lkTag text;
alter table tag add column idCtTag int2;
alter table tag drop column vlpriority;

ALTER TABLE contenttag DROP CONSTRAINT idtag_contenttag_tag;

------------------------------------------
--(Taranto, 27/12/2018. Dev-019 backend) *executado
alter table tag drop constraint tag_pkey;
select setval((select pg_get_serial_sequence('usertag', 'idusertag')), (select max(idusertag)+1 from usertag));
------------------------------------------
--(Taranto, 11/01/2019. Dev-019 backend) *executado
alter table content add column dhPublish timestamp NOT NULL DEFAULT 'now'::text::timestamp;
alter table usercontentinteraction add column dhRead timestamp NOT NULL DEFAULT 'now'::text::timestamp;
alter table userTag add column dhRegister timestamp NOT NULL DEFAULT 'now'::text::timestamp;


create table userChannel (
	idUserChannel serial not null,
	idChannel integer not null,
	idUser integer not null,
	dhRead timestamp not null default 'now'::text::timestamp
);

create table channelTag (
	idChannelTag serial not null,
	idChannel integer not null,
	idTag integer not null
);

--alter table content_data add column dhPublish timestamp default now();
alter table userchannel add constraint userchannel_idUser_idChannel unique (idUser, idChannel);

ALTER DATABASE postgres SET timezone TO 'America/Sao_Paulo';
select pg_reload_conf();
alter table usercontentinteraction drop constraint idcontent_content_usercontentinteraction;
------------------------------------------
--(Taranto, 18/01/2019. Dev-019 backend) *executado
alter table content_data alter column dhPublish set data type text;
------------------------------------------
--(Taranto, 20/01/2019. Dev-019 backend) *executado
alter table usercontentinteraction drop constraint iduser_usercontentinteraction_user;

create table publisher_data (
	idexcel integer, 
	nmuser varchar(63), 
	lkwebsite text, 
	piavatar text, 
	dstestimony text
);

alter table usr add column idExternal integer;
alter table usr alter column emuser drop not null;
alter table content add column idpublisher integer;
alter table content rename column shShowProducer to shShowPublisher;
alter table usr alter column nmCompany set data type varchar(63);
alter table content drop column idproducer;
drop table producer;
drop table author_data;
alter table content_data rename column idauthor to idpublisher;
alter table content alter column picontent drop not null;
alter table content alter column idctcontent drop not null;
------------------------------------------
--(Taranto, 21/01/2019. Dev-019 backend) *executado
alter table tag rename column lktag to pitag;
alter table tag_data rename column lktag to pitag;
------------------------------------------
--(Taranto, 24/01/2019. Dev-020 backend) *executado
alter table channel add column piicon text;
alter table channel_data add column piicon text;
------------------------------------------
--(Taranto, 29/01/2019. Dev-020 backend) *executado
create table grp (
	idgroup serial,
	nmgroup text not null
);
create table userGroup (
	idUserGroup serial,
	idUser integer,
	idGroup integer,
	isGroupAdmin boolean default false
);
------------------------------------------
--(Taranto, 03/02/2019. Dev-020 backend) *executado
alter table content add column idExternal integer;
alter table content_data add column idExternal integer;
alter table content_data add column idOriginal integer;
alter table content_data drop column idcontent;
alter table content add column isActive boolean default true;
alter table content_data add column isActive text;

alter table channel add column idExternal integer;
alter table channel_data add column idExternal integer;
alter table channel_data add column idOriginal integer;
alter table channel_data drop column idchannel;
alter table channel add column isActive boolean default true;
alter table channel_data add column isActive text;
alter table channel alter column pichannel drop not null;
alter table channel alter column nmchannel drop not null;

alter table publisher_data rename column idExcel to idExternal;
alter table publisher_data add column idOriginal integer;
alter table usr add column isActive boolean default true;
alter table publisher_data add column isActive text;

drop table contentchannel_data;
create table contentchannel_data (
	idchannel integer,
	aridContent text
);

CREATE or replace FUNCTION isDiff (v1 text, v2 text) RETURNS boolean AS $isDiff$ DECLARE isDiff boolean; begin
	  select (v1 is null and v2 is not null) or (v1 is not null and v2 is null) or ((v1 is not null and v2 is not null) and (v1 != v2))
into isDiff; RETURN isDiff; END; $isDiff$ LANGUAGE plpgsql;

CREATE or replace FUNCTION isDiff (v1 integer, v2 integer) RETURNS boolean AS $isDiff$ DECLARE isDiff boolean; begin
	  select isDiff(v1::text, v2::text)
into isDiff; RETURN isDiff; END; $isDiff$ LANGUAGE plpgsql;

CREATE or replace FUNCTION isDiff (v1 boolean, v2 boolean) RETURNS boolean AS $isDiff$ DECLARE isDiff boolean; begin
	  select isDiff(v1::text, v2::text)
into isDiff; RETURN isDiff; END; $isDiff$ LANGUAGE plpgsql;

CREATE or replace FUNCTION isDiff (v1 timestamp, v2 timestamp) RETURNS boolean AS $isDiff$ DECLARE isDiff boolean; begin
	  select isDiff(v1::text, v2::text)
into isDiff; RETURN isDiff; END; $isDiff$ LANGUAGE plpgsql;

/* teste isDiff
select 
	isDiff('','2') is true, isDiff('1','') is true, isDiff('',null) is true, isDiff(null,'') is true, isDiff('', '') is false,
	isDiff('1','2') is true, isDiff(null,'2') is true, isDiff('1',null) is true, isDiff(null, null) is false, 
	isDiff(1::text,2::text) is true, isDiff(null::text,null::text) is false, isDiff(1::text,null::text) is true, isDiff(null::text,2::text) is true
	
select 
	isDiff('','2'), isDiff('1',''), isDiff('',null),isDiff(null,''), isDiff('', '')
	isDiff('1','2'), isDiff(null,'2'), isDiff('1',null), isDiff(null, null), 
	isDiff(1::text,2::text), isDiff(null::text,2::text), isDiff(1::text,null::text), isDiff(null::text,null::text)
*/

CREATE or replace FUNCTION shShow(nmLayoutItem text, idTempl text) RETURNS boolean AS $shShow$ DECLARE shShow boolean; begin
	select nmLayoutItem is not null and (
  		(lower(nmLayoutItem) = 'title' and (idTempl = '1' or idTempl = '3' or idTempl = '4' or idTempl = '6')) or
  		(lower(nmLayoutItem) = 'description' and (idTempl = '1' or idTempl = '3')) or
  		(lower(nmLayoutItem) = 'fullscreenimage' and (idTempl = '2' or idTempl = '3' or idTempl = '5' or idTempl = '6' or idTempl = '8')) or
  		(lower(nmLayoutItem) = 'actionbuttons' and (idTempl != '5')) or
  		(lower(nmLayoutItem) = 'publisher' and (idTempl != '5')) or
  		(lower(nmLayoutItem) = 'shortcard' and (idTempl = '7' or idTempl = '8'))
	)
into shShow; RETURN shShow; END; $shShow$ LANGUAGE plpgsql;

/* teste shShow
select 
	shShow('title', 1::text) as t1, shShow('title', 2::text) as t2, shShow('title', 3::text) as t3, shShow('title', 4::text) as t4, shShow('title', 5::text) as t5, shShow('title', 6::text) as t6, shShow('title', 7::text) as t7, shShow('title', 8::text) as t8, shShow('title', 9::text) as t9,
	shShow('description', 1::text), shShow('description', 2::text), shShow('description', 3::text), shShow('description', 4::text), shShow('description', 5::text), shShow('description', 6::text), shShow('description', 7::text), shShow('description', 8::text), shShow('description', 9::text),
	shShow('fullscreenimage', 1::text), shShow('fullscreenimage', 2::text), shShow('fullscreenimage', 3::text), shShow('fullscreenimage', 4::text), shShow('fullscreenimage', 5::text), shShow('fullscreenimage', 6::text), shShow('fullscreenimage', 7::text), shShow('fullscreenimage', 8::text), shShow('fullscreenimage', 9::text),
	shShow('actionbuttons', 1::text), shShow('actionbuttons', 2::text), shShow('actionbuttons', 3::text), shShow('actionbuttons', 4::text), shShow('actionbuttons', 5::text), shShow('actionbuttons', 6::text), shShow('actionbuttons', 7::text), shShow('actionbuttons', 8::text), shShow('actionbuttons', 9::text),
	shShow('publisher', 1::text), shShow('publisher', 2::text), shShow('publisher', 3::text), shShow('publisher', 4::text), shShow('publisher', 5::text), shShow('publisher', 6::text), shShow('publisher', 7::text), shShow('publisher', 8::text), shShow('publisher', 9::text),
	shShow('shortcard', 1::text), shShow('shortcard', 2::text), shShow('shortcard', 3::text), shShow('shortcard', 4::text), shShow('shortcard', 5::text), shShow('shortcard', 6::text), shShow('shortcard', 7::text), shShow('shortcard', 8::text), shShow('shortcard', 9::text)
*/

------------------------------------------
--(Taranto, 12/02/2019. Dev-020 backend) *executado
alter table channel add column idPublisher integer;
alter table channel add column isPrivate boolean;
alter table channel_data add column idPublisher text;
alter table channel_data add column isPrivate text;
alter table content add column nrLanguage integer;
alter table content_data add column nrLanguage integer;
------------------------------------------
--(Taranto, 28/02/2019. Dev-020 backend) *executado

create table ChannelGroup (
	idChannelGroup serial,
	idChannel integer,
	idGroup integer
);

--alter table channel add primary key (idchannel);
alter table channelgroup add primary key (idchannelgroup);
alter table channeltag add primary key (idchanneltag);
--alter table content add primary key (idcontent);
--alter table contentchannel add primary key (idcontentchannel);
--alter table ctcontent add primary key (idctcontent);
--alter table emailfailure add primary key (idemailfailure);
alter table grp add primary key (idgroup);
--alter table notifymsg add primary key (idnotifymsg);
alter table tag add primary key (idtag);
alter table userchannel add primary key (iduserchannel);
--alter table usercontentinteraction add primary key (idusercontentinteraction);
alter table usergroup add primary key (idusergroup);
--alter table usertag add primary key (idusertag);
--alter table usr add primary key (iduser);

ALTER TABLE channel add constraint fkidpublisher FOREIGN KEY (idpublisher) REFERENCES usr(iduser);
ALTER TABLE channelgroup add constraint fkidgroup FOREIGN KEY (idgroup) REFERENCES grp(idgroup);
ALTER TABLE channelgroup add constraint fkidchannel FOREIGN KEY (idchannel) REFERENCES channel(idchannel);
ALTER TABLE channeltag add constraint fkidchannel FOREIGN KEY (idchannel) REFERENCES channel(idchannel);
ALTER TABLE channeltag add constraint fkidtag FOREIGN KEY (idtag) REFERENCES tag(idtag);
ALTER TABLE content add constraint fkidctcontent FOREIGN KEY (idctcontent) REFERENCES ctcontent(idctcontent);
ALTER TABLE content add constraint fkidpublisher FOREIGN KEY (idpublisher) REFERENCES usr(iduser);
ALTER TABLE contentchannel add constraint fkidchannel FOREIGN KEY (idchannel) REFERENCES channel(idchannel);
ALTER TABLE contentchannel add constraint fkidcontent FOREIGN KEY (idcontent) REFERENCES content(idcontent);
ALTER TABLE userchannel add constraint fkiduser FOREIGN KEY (iduser) REFERENCES usr(iduser);
ALTER TABLE userchannel add constraint fkidchannel FOREIGN KEY (idchannel) REFERENCES channel(idchannel);
alter table usercontentinteraction rename to usercontent;
alter table usercontent rename column idusercontentinteraction to idusercontent;
ALTER TABLE usercontent add constraint fkidusercontent FOREIGN KEY (idcontent) REFERENCES content(idcontent);
ALTER TABLE usercontent add constraint fkiduser FOREIGN KEY (iduser) REFERENCES usr(iduser);
alter table grp add column isActive boolean default true;
ALTER TABLE usergroup add constraint fkiduser FOREIGN KEY (iduser) REFERENCES usr(iduser);
ALTER TABLE usergroup add constraint fkidgroup FOREIGN KEY (idgroup) REFERENCES grp(idgroup);
ALTER TABLE usertag add constraint fkiduser FOREIGN KEY (iduser) REFERENCES usr(iduser);
ALTER TABLE usertag add constraint fkidtag FOREIGN KEY (idtag) REFERENCES tag(idtag);

--alter table content_data add column nrLanguage integer;
------------------------------------------
--(Taranto, 11/03/2019. Dev-020 backend) *executado
create index idxchannel on channel (isactive, vlsort); --vlsort, isaward, isplaybook, isactive
create index idxchannel2 on channel (isactive, idPublisher);
create index idxchannel3 on channel (isPlaybook, isactive, vlsort);
create index idxchannel4 on channel (isaward, isactive, vlsort);

create index idxchannelgroup on channelgroup (idchannel, idgroup);
create index idxchannelgroup2 on channelgroup (idgroup, idChannel);

create index idxchanneltag on channeltag (idchannel, idtag);
create index idxchanneltag2 on channeltag (idtag, idchannel);

create index idxcontent on content (isactive, dhPublish);
create index idxcontent2 on content (isactive, vlsort, dhPublish);

create index idxcontentchannel on contentchannel (idchannel, vlsort);

create index idxuserchannel on userchannel (iduser, dhread);

create index idxusercontent on usercontent (idcontent, iduser, qtView asc NULLS FIRST);

create index idxgroup on grp (isactive);

create index idxusergroup on usergroup (idgroup, iduser);
create index idxusergroup2 on usergroup (isgroupadmin, iduser);

create index idxusertag on usertag (iduser, idtag);

create index idxtag on tag (idcttag, nmtag);
create index idxtag2 on tag (nmtag);

create index idxuser on usr (isactive, emuser);
create index idxuser2 on usr (emuser);
create index idxuser3 on usr (isactive, nmuser);
create index idxuser4 on usr (nmuser);

------------------------------------------
--(Taranto, 12/03/2019. Dev-020 backend) *executado
--alter table grp add column isactive boolean default true;

------------------------------------------
--(Taranto, 20/03/2019. Dev-020 backend) *executado
alter table channel drop column isaward;
alter table channel drop column isprivate;
alter table content add column isplaybook boolean;

alter table channel_data drop column isaward;
alter table channel_data drop column isprivate;
alter table content_data add column isplaybook boolean;

alter table contentchannel alter column idchannel set not null;
alter table contentchannel alter column vlsort drop not null; 
update content set isPlaybook = false where isplaybook is null;

------------------------------------------
--(Taranto, 28/03/2019. Dev-020 backend) *executado

delete from usergroup where idusergroup in (
	select idAnyDuplicated from ( 
		select count(iduser), max(idusergroup) as idAnyDuplicated, iduser, idgroup from usergroup group by iduser, idgroup having count(iduser) > 1 order by count(iduser) desc
	) anyDuplicated
);

delete from contentChannel where idContentChannel in (
	select idAnyDuplicated from ( 
		select count(idcontent), max(idContentChannel) as idAnyDuplicated, idChannel, idcontent from contentChannel group by idChannel, idcontent having count(idcontentchannel) > 1 order by count(idChannel) desc
	) anyDuplicated
);

delete from usercontent where idusercontent in (
	select idAnyDuplicated from (
		select count(idcontent), max(idusercontent) as idAnyDuplicated, iduser, idcontent from usercontent group by iduser, idcontent having count(idusercontent) > 1 order by count(iduser) desc
	) anyDuplicated
);

alter table channelgroup add unique (idchannel, idgroup);
alter table channeltag add unique (idchannel, idtag);
alter table contentchannel add unique (idchannel, idcontent);
alter table contenttag add unique (idcontent, idtag);
alter table ctcontent add unique (nmctcontent);
alter table tag add unique (nmtag);
alter table userchannel add unique (iduser, idchannel);
alter table usercontent add unique (iduser, idcontent);
alter table usergroup add unique (iduser, idgroup);
alter table usertag add unique (iduser, idtag);
alter table usr add unique (emuser);

alter table channel add unique(idexternal);
alter table channel_data add unique(idexternal);
alter table content add unique(idexternal);
alter table content_data add unique(idexternal);
alter table publisher_data add unique(idexternal);
alter table usr add unique(idexternal);

CREATE EXTENSION IF NOT EXISTS citext;
ALTER TABLE usr ALTER COLUMN emuser TYPE citext;  

------------------------------------------
--(Taranto, 05/04/2019. Dev-020 backend) *executado

update content set isplaybook = true where isplaybook is null;
alter table content alter column isplaybook set default true;
alter table content alter column isplaybook set not null;

update channel set isplaybook = true where isplaybook is null;
alter table channel alter column isplaybook set default true;
alter table channel alter column isplaybook set not null;

create table userPermission (
	idUserPermission serial,
	idUser integer not null,
	canPostSeContent boolean default false,
	canPostSeChannel boolean default false,
	canSimulateSomeone boolean default false
);

alter table userPermission add primary key (idUserPermission);
ALTER TABLE userPermission add constraint fkiduserPermission FOREIGN KEY (idUser) REFERENCES usr(idUser);
alter table userPermission add unique (idUser);
create index idxuserPermission on userPermission (idUser);

------------------------------------------
--(Taranto, 09/04/2019. Dev-020 backend) *executado
alter table channel add column dsChannel text;
alter table channel_data add column dsChannel text;

------------------------------------------
--(Taranto, 03/05/2019. Dev-020 backend) *executado
alter table userPermission add column canReloadEnv boolean default false;

------------------------------------------
--(Taranto, 26/05/2019. Dev-021 backend)  *executado
ALTER TABLE usercontent ALTER COLUMN islike SET DEFAULT false;
ALTER TABLE usercontent ALTER COLUMN isfavorite SET DEFAULT false;
ALTER TABLE usercontent ALTER COLUMN qtview SET DEFAULT 0;
ALTER TABLE usercontent ALTER COLUMN qtconversion SET DEFAULT 0;

------------------------------------------
--(Taranto, 01/06/2019. Dev-023 backend)  *executado	
update content set shShowShareButton = shShowActionButtons where shShowShareButton is null;

------------------------------------------
--(Taranto, 06/08/2019. Dev-024 backend)  *executado	
alter table channel add column ctChannelView int2 default 1;

------------------------------------------
--(Taranto, 09/08/2019. Dev-024 backend)  *executado
alter table channel rename column ctChannelView to idCtChannelView;

------------------------------------------
--(Taranto, 13/08/2019. Dev-025 backend)  *executado
alter table channel add column dhPublish timestamp NOT NULL DEFAULT 'now'::text::timestamp;
alter table channel add column dhUpdate timestamp NOT NULL DEFAULT 'now'::text::timestamp;
alter table content add column dhUpdate timestamp NOT NULL DEFAULT 'now'::text::timestamp;

------------------------------------------
--(Taranto, 15/08/2019. Dev-025 backend)  *executado
alter table channel drop column dhUpdate;

------------------------------------------
--(Taranto, 20/08/2019. Dev-025 backend)  *executado
alter table usercontent add column dhLastView timestamp;
alter table usercontent add column dhLastConversion timestamp;

------------------------------------------
--(Taranto, 22/08/2019. Dev-025 backend)  *executado
alter table usercontent drop column dhread;
alter table userchannel drop column dhread;

------------------------------------------
--(Taranto, 26/08/2019. Dev-025 backend)  *executado
alter table content add column qtEval integer not null default 0;
alter table content add column vlEval numeric(2,1) default null;
alter table userContent add column vlEval smallint default null;

------------------------------------------
--(Taranto, 16/09/2019. Dev-026 backend) *executado
alter table userChannel add column dhLastConversion timestamp;
ALTER TABLE userChannel add COLUMN qtconversion integer DEFAULT 0;

------------------------------------------
--(Taranto, 24/09/2019. Dev-027 backend)  *executado
alter table notifymsg drop column shshowsysandroid;
alter table notifymsg drop column shshowsysiphone;
alter table notifymsg add column ctSystem integer;

------------------------------------------
--(Taranto, 25/09/2019. Dev-027 backend)  *executado
alter table usergroup add column isFavorite boolean default false not null;

------------------------------------------
--(Taranto, 19/10/2019. Dev-028 backend) 
 alter table userpermission add column canPostWorkspace boolean default false;
 alter table userpermission add constraint iduser_user foreign key (idUser) references usr(idUser);

CREATE TABLE workspace (
	idWorkspace serial NOT NULL,
	nmWorkspace varchar(60) NOT NULL,
	idUserResponsible integer NOT NULL,
	piWorkspace varchar(60) NULL,
	CONSTRAINT workspace_pkey PRIMARY KEY (idWorkspace),
	CONSTRAINT iduserresponsible_workspace_user FOREIGN KEY (idUserResponsible) REFERENCES usr(idUser)
)
WITH (
	OIDS=FALSE
);
ALTER TABLE public.workspace OWNER TO postgres;

alter table workspace add column isactive boolean default true not null;
alter table workspace alter column nmworkspace drop not null;
alter table workspace alter column piworkspace drop not null;

alter table grp add column idWorkspace integer;
alter table grp add constraint idWorkspace_workspace foreign key (idWorkspace) references workspace(idWorkspace);

alter table usr add column idWorkspaceDefault integer;

--insert into workspace (nmWorkspace, idUserResponsible, piWorkspace, isActive) values ('Salesfy', 228, null, true);

update grp set idWorkspace = 1 where true;
update usr set idWorkspaceDefault = 1 where true;

------------------------------------------
--(Taranto, 19/10/2019. Dev-028 backend) *executado
update usr set nmuser = split_part(emuser, '@', 1) where nmuser is null;

------------------------------------------
--(Taranto, 19/10/2019. Dev-029 backend) *executado
alter table usergroup add column idCtUserGroupAccess integer not null default 3;
update usergroup set idCtUserGroupAccess = 1 where isgroupadmin;
update usergroup set idCtUserGroupAccess = 2 where not isgroupadmin;

------------------------------------------
--(Taranto, 05/05/2020. develop backend) *executado
alter table emailfailure alter column cdErrorResponse drop not null;

------------------------------------------
--(Taranto, 12/06/2020. dev-049 backend) *executado
CREATE TABLE public.LocalStorage (
	idLocalStorage serial NOT NULL,
	nmKey varchar(60) NOT NULL,
	dsValue varchar(30) NOT NULL,
	dhStorage timestamp NOT NULL DEFAULT 'now'::text::date,
	CONSTRAINT idLocalStorage_pkey PRIMARY KEY (idLocalStorage)
)
WITH (
	OIDS=FALSE
) ;
ALTER TABLE public.usr OWNER TO postgres;
