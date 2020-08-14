--Arquivo oficial de migração do excel.
delete from content_data;
delete from publisher_data;
delete from ctContent_data;
delete from channel_data;
delete from contentChannel_data;
delete from tag_data;

select count(*) from content_data;
select count(*) from publisher_data;
select count(*) from ctContent_data;
select count(*) from channel_data;
select count(*) from contentChannel_data;
select count(*) from tag_data;

select * from content_data;
select * from publisher_data;
select * from ctContent_data;
select * from channel_data;
select * from contentChannel_data;
select * from tag_data;

-- '/home/taranto/Documents/Development/csvs-hatchers/Dados para importação HATCHERS - xxx.csv'
-- '/Users/everton/hatchers/importar/Dados para importação HATCHERS - xxx.csv'
copy content_data(idExternal,nmContent,ctContent,lkContent, idPublisher, dsContent, piContent, idTemplate, isShareable, idCtAudience, idCtNiche, idCtSubject1, idCtSubject2, idCtSubject3, vlQualification, dhPublish, isActive, idOriginal, nrLanguage, isPlaybook) FROM '/home/taranto/Documents/Development/csvs-hatchers/Dados para importação HATCHERS - content_data.csv' DELIMITER ',' CSV HEADER;
copy publisher_data(idExternal,nmuser,lkwebsite,piavatar,dstestimony,idOriginal,isActive)FROM '/home/taranto/Documents/Development/csvs-hatchers/Dados para importação HATCHERS - publisher_data.csv' DELIMITER ',' CSV HEADER;
copy channel_data(idExternal,nmChannel, piChannel, piIcon, idPublisher, nrOrderChannel, isPlaybook, idCtAudience, idCtNiche, idCtSubject1, idCtSubject2, idCtSubject3, idOriginal, isActive, dsChannel) FROM '/home/taranto/Documents/Development/csvs-hatchers/Dados para importação HATCHERS - channel_data.csv' DELIMITER ',' CSV HEADER;
copy ctContent_data(idCtContent,nmCtContent) FROM '/home/taranto/Documents/Development/csvs-hatchers/Dados para importação HATCHERS - ctContent_data.csv' DELIMITER ',' CSV HEADER;
copy contentChannel_data(idChannel,arIdContent) FROM '/home/taranto/Documents/Development/csvs-hatchers/Dados para importação HATCHERS - contentChannel_data.csv' DELIMITER ',' CSV HEADER;
copy tag_data(idTag,nmTag,idCtTag, pitag) FROM '/home/taranto/Documents/Development/csvs-hatchers/Dados para importação HATCHERS - tag_data.csv' DELIMITER ',' CSV HEADER;
---------------------------------------------------------------

-- CONTENT
-- select * from content order by idcontent desc;
-- select * from content_data order by idexternal desc;

update content set idExternal = content_data.idExternal from content_data where content_data.idOriginal = content.idcontent returning *;

insert into content (idExternal) (
	select content_data.idExternal
    from content_data
	where idExternal is not null and content_data.idPublisher != '#N/A' and content_data.ctContent != '#N/A' and
   	idExternal not in (select idExternal from content where idexternal is not null)
) returning *;

UPDATE content SET
	nmContent = cd.nmContent,
	piContent = cd.piContent,
	dsContent = cd.dsContent,
	idctContent = cd.ctContent::smallint,
	lkContent = cd.lkContent,
	shshowdescription = shShow('description', cd.idTemplate),
	shshowTitle = shShow('title', cd.idTemplate),
	shShowFullscreenImage = shShow('fullscreenimage', cd.idTemplate),
	shShowActionButtons = shShow('actionbuttons', cd.idTemplate),
	shShowPublisher = shShow('publisher', cd.idTemplate),
	shShowShortCard = shShow('shortcard', cd.idTemplate),
    shShowShareButton = cd.isShareable,
    vlSort = cd.vlQualification,
	dhPublish = cd.dhPublish::timestamp,
	isplaybook = cd.isplaybook,
	--idPublisher = cd.idpublisher::integer, -- idPublisher é atualizado posteriormente
	isActive = cd.isActive::boolean,
	nrLanguage = cd.nrLanguage
FROM content_data cd WHERE content.idExternal = cd.idExternal
and cd.idExternal is not null and cd.idPublisher != '#N/A' and cd.ctContent != '#N/A' and (
	isDiff(content.nmContent, cd.nmContent) or
	isDiff(content.piContent, cd.piContent) or
	isDiff(content.dsContent, cd.dsContent) or
	isDiff(content.idctContent, cd.ctContent::integer) or
	isDiff(content.lkContent, cd.lkContent) or
	isDiff(content.shShowDescription, shShow('description', cd.idTemplate)) or
	isDiff(content.shShowTitle, shShow('title', cd.idtemplate)) or
	isDiff(content.shShowFullscreenImage, shShow('fullscreenimage', cd.idTemplate)) or
	isDiff(content.shShowActionButtons, shShow('actionbuttons', cd.idTemplate)) or
	isDiff(content.shShowPublisher, shShow('publisher', cd.idTemplate)) or
	isDiff(content.shShowShortCard, shShow('shortcard', cd.idTemplate)) or
	isDiff(content.shShowShareButton, cd.isShareable) or
	isDiff(content.vlSort, cd.vlQualification) or
--	isDiff(content.idPublisher, cd.idPublisher::boolean) or -- idPublisher é atualizado posteriormente
	isDiff(content.dhPublish, cd.dhPublish::timestamp) or
	isDiff(content.isActive, cd.isActive::boolean) or
	isDiff(content.nrLanguage, cd.nrLanguage) or
	isDiff(content.isPlaybook, cd.isPlaybook)
) returning *;

-- CHANNEL
-- select * from channel;
-- select * from channel_data;

update channel set idExternal = channel_data.idExternal from channel_data where channel_data.idOriginal = channel.idchannel returning *; 

insert into channel (idExternal, nmChannel) (
	select idExternal, nmchannel
    from channel_data
	where idExternal not in (select idExternal from channel where idexternal is not null) 
) returning *;

UPDATE channel SET
	nmchannel = chd.nmchannel,
	pichannel = chd.pichannel,
	piicon = chd.piicon,
	vlsort = chd.nrorderchannel,
	isPlaybook = chd.isPlaybook,
	isActive = chd.isActive::boolean,
	dsChannel = chd.dsChannel
--	idPublisher = chd.idPublisher::integer  -- idPublisher é atualizado posteriormente
FROM channel_data chd WHERE channel.idExternal = chd.idExternal and (
	isDiff(channel.nmchannel, chd.nmchannel) or
	isDiff(channel.pichannel, chd.pichannel) or
	isDiff(channel.piicon, chd.piicon) or 
	isDiff(channel.vlsort, chd.nrorderchannel) or
	isDiff(channel.isPlaybook, chd.isPlaybook) or
	isDiff(channel.isActive, chd.isActive::boolean) or
	isDiff(channel.dsChannel, chd.dsChannel)
--	isDiff(channel.idPublisher, chd.idPublisher::integer) -- idPublisher é atualizado posteriormente
) returning *;


--USER/PUBLISHER ---
-- select * from usr;
-- select * from publisher_data;

update usr set idExternal = publisher_data.idExternal from publisher_data where publisher_data.idOriginal = usr.iduser returning *;

insert into usr (idexternal, dhregister) (
	select publisher_data.idExternal, now()
    from publisher_data
	where idExternal not in (select idExternal from usr where idexternal is not null) 
) returning *;
	
update usr set
	nmuser = pd.nmuser,
	nmcompany = pd.nmuser,
	lkwebsite = pd.lkwebsite,
	piavatar = pd.piavatar,
	dstestimony = pd.dstestimony,
	isActive = pd.isActive::boolean
from publisher_data pd where usr.idexternal = pd.idExternal and (
	isDiff(usr.nmuser, pd.nmuser) or 
	isDiff(usr.nmcompany, pd.nmuser) or 
	isDiff(usr.lkwebsite, pd.lkwebsite) or 
	isDiff(usr.piavatar, pd.piavatar) or 
	isDiff(usr.dstestimony, pd.dstestimony) or 
	isDiff(usr.isActive, pd.isActive::boolean)
) returning *;
 
update content set idpublisher = u.iduser
	from usr u 
	join content_data cd on u.idexternal = cd.idpublisher::integer 
	where cd.idexternal = content.idexternal and 
	cd.idPublisher != '#N/A' and (isDiff(content.idpublisher, u.iduser)) 
	returning *;

update channel set idpublisher = u.iduser
	from usr u 
	join channel_data chd on u.idexternal = chd.idpublisher::integer 
	where chd.idexternal = channel.idexternal and 
	chd.idPublisher != '#N/A' and (isDiff(channel.idpublisher, u.iduser)) 
	returning *;
	
	
--TAG
-- select * from tag;
-- select * from tag_data;

insert into tag (idtag, nmtag, idcttag, pitag) (
	select idtag, nmtag, idcttag, pitag from tag_data 
	where tag_data.idtag not in (select idTag from tag)
) returning *;

update tag set 
	nmtag = tag_data.nmtag, 
	idcttag = tag_data.idcttag,
	pitag = tag_data.pitag
from tag_data where tag.idtag = tag_data.idtag and (
	isDiff(tag.pitag, tag_data.pitag) or 
	isDiff(tag.idcttag, tag_data.idcttag) or 
	isDiff(tag.nmtag, tag_data.nmtag)
) returning *;

-- CT_CONTENT
-- select * from ctcontent;
-- select * from ctcontent_data;

insert into ctcontent (idctcontent, nmctcontent) (
	select idctcontent, nmctcontent from ctcontent_data 
	where ctcontent_data.idctcontent not in (select idctcontent from ctcontent)
) returning *;

update ctcontent set 
	nmctcontent = ctcontent_data.nmctcontent
from ctcontent_data where ctcontent.idctcontent = ctcontent_data.idctcontent and (
	ctcontent.nmctcontent != ctcontent_data.nmctcontent
)  returning *;

-- CONTENT_CHANNEL
-- select * from contentChannel_data;
-- select * from contentchannel;

delete from contentchannel where idcontentchannel in (
	select idcontentchannel from contentchannel
	join channel ch using(idchannel) 
	join content c using(idcontent)
	where c.idexternal is not null or ch.idexternal is not null
) returning *;

insert into contentchannel (idchannel, idcontent, vlSort) (
	select channel.idchannel, content.idcontent::integer, ROW_NUMBER() OVER() as vlSort 
	from (
		SELECT 
		    contentchannel_data.idchannel::integer as idChannelExternal, 
		    regexp_split_to_table(contentchannel_data.aridContent, ',')::integer as idContentExternal
		FROM contentchannel_data
	) contentchannel_data
	join channel on channel.idexternal::integer = contentchannel_data.idChannelExternal
	join content on content.idexternal::integer = contentchannel_data.idContentExternal
	left join contentchannel on contentchannel.idchannel = channel.idchannel and contentchannel.idcontent = content.idcontent  
	where contentchannel.idcontent is null and contentchannel.idchannel is null
	and content.idexternal::integer in (select idexternal from content where idexternal is not null)
	and channel.idexternal::integer in (select idexternal from channel where idexternal is not null)
) returning *;

-- CHANNEL_TAG
-- select * from channel_data
-- select * from channeltag

delete from channeltag where idchannel in (select idchannel from channel where idexternal is not null) returning *;

insert into channeltag (idchannel, idtag) (
	select channel.idchannel, excel_data.idtag from (
		select idexternal, chd.idctaudience::integer as idtag from channel_data chd where chd.idctaudience != '#N/A'
		union
		select idexternal, chd.idctniche::integer from channel_data chd where chd.idctniche != '#N/A'
		union
		select idexternal, chd.idctsubject1::integer from channel_data chd where chd.idctsubject1 != '#N/A'
		union
		select idexternal, chd.idctsubject2::integer from channel_data chd where chd.idctsubject2 != '#N/A'
		union
		select idexternal, chd.idctsubject3::integer from channel_data chd where chd.idctsubject3 != '#N/A'
	) excel_data 
	join channel using(idExternal)
	left join channeltag on channeltag.idchannel = channel.idchannel and excel_data.idtag = channeltag.idtag
	where 
	channeltag.idchannel is null 
	and channeltag.idtag is null
	and channel.idexternal is not null
) returning *;

-- CONTENT_TAG
-- select * from content_data
-- select * from contenttag

delete from contenttag where idcontent in (select idcontent from content where idexternal is not null) returning *;

insert into contenttag (idcontent, idtag) (
	select content.idcontent, excel_data.idtag from (
		select idexternal, chd.idctaudience::integer as idtag from content_data chd where chd.idctaudience != '#N/A'
		union
		select idexternal, chd.idctniche::integer from content_data chd where chd.idctniche != '#N/A'
		union
		select idexternal, chd.idctsubject1::integer from content_data chd where chd.idctsubject1 != '#N/A'
		union
		select idexternal, chd.idctsubject2::integer from content_data chd where chd.idctsubject2 != '#N/A'
		union
		select idexternal, chd.idctsubject3::integer from content_data chd where chd.idctsubject3 != '#N/A'
	) excel_data 
	join content using(idExternal)
	left join contenttag on contenttag.idcontent = content.idcontent and excel_data.idtag = contenttag.idtag
	where 
	contenttag.idcontent is null 
	and contenttag.idtag is null
	and content.idexternal is not null
) returning *;