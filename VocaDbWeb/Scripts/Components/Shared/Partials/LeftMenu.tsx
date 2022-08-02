import EntryUrlMapper from '@Shared/EntryUrlMapper';
import functions from '@Shared/GlobalFunctions';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import MainNavigationItems from './MainNavigationItems';
import PatreonLink from './PatreonLink';

interface BannerLinkProps {
	title: string;
	url: string;
	img: string;
}

const BannerLink = React.memo(
	({ title, url, img }: BannerLinkProps): React.ReactElement => {
		return (
			<a
				href={url}
				onClick={(e): void => {
					functions.trackOutboundLink(e.nativeEvent);
				}}
			>
				<img
					src={functions.mergeUrls(
						vdb.values.staticContentHost,
						`/banners/${img}`,
					)}
					alt={title}
					title={title}
				/>
			</a>
		);
	},
);

interface BannerProps {
	title: string;
	url: string;
	img: string;
}

const Banner = React.memo(
	({ title, url, img }: BannerProps): React.ReactElement => (
		<li>
			<BannerLink title={title} url={url} img={img} />
		</li>
	),
);

interface SmallBannerProps {
	title: string;
	url: string;
	img: string;
}

const SmallBanner = React.memo(
	({ title, url, img }: SmallBannerProps): React.ReactElement => (
		<div>
			<BannerLink title={title} url={url} img={img} />
		</div>
	),
);

interface SocialLinkProps {
	title: string;
	url: string;
	img: string;
}

const SocialLink = React.memo(
	({ title, url, img }: SocialLinkProps): React.ReactElement => (
		<BannerLink title={title} url={url} img={img} />
	),
);

const LeftMenu = React.memo(
	(): React.ReactElement => {
		const { t } = useTranslation(['ViewRes']);

		return (
			<div className="menu">
				<div className="well">
					<Link to="/">
						<img
							src={
								vdb.values.bannerUrl ??
								functions.mergeUrls(
									vdb.values.staticContentHost,
									'/img/vocaDB-title.png',
								)
							}
							className="site-logo"
							alt={vdb.values.siteName}
							title={vdb.values.siteName}
						/>
					</Link>
					<p className="slogan">{vdb.values.slogan}</p>
				</div>

				<div className="well sidebar-nav">
					<MainNavigationItems />
					{vdb.values.loggedUser && (
						<>
							<br />
							<p className="user">
								{t('ViewRes:Layout.Welcome')}{' '}
								<Link
									to={EntryUrlMapper.details_user_byName(
										vdb.values.loggedUser.name,
									)}
								>
									{vdb.values.loggedUser.name}
								</Link>
							</p>
						</>
					)}
				</div>

				<div className="well">
					{vdb.values.appLinks && vdb.values.appLinks.length > 0 && (
						<div id="appLinks">
							{vdb.values.appLinks.map((link, i) => (
								<React.Fragment key={i}>
									{i > 0 && ' '}
									<SmallBanner
										title={link.title}
										url={link.url}
										img={link.bannerImg}
									/>
								</React.Fragment>
							))}
							<br />
						</div>
					)}

					<h4>{t('ViewRes:Layout.SocialSites')}</h4>
					<div id="socialSites">
						{vdb.values.socialLinks &&
							vdb.values.socialLinks.map((link, i) => (
								<React.Fragment key={i}>
									{i > 0 && ' '}
									<SocialLink
										title={link.title}
										url={link.url}
										img={link.bannerImg}
									/>
								</React.Fragment>
							))}
					</div>

					<br />
					<h4>{t('ViewRes:Layout.RelatedSites')}</h4>
					<ul id="banners">
						{vdb.values.bigBanners &&
							vdb.values.bigBanners.map((link, i) => (
								<React.Fragment key={i}>
									{i > 0 && ' '}
									<Banner
										title={link.title}
										url={link.url}
										img={link.bannerImg}
									/>
								</React.Fragment>
							))}
					</ul>
					<div id="banners-small">
						{vdb.values.smallBanners &&
							vdb.values.smallBanners.map((link, i) => (
								<React.Fragment key={i}>
									{i > 0 && ' '}
									<SmallBanner
										title={link.title}
										url={link.url}
										img={link.bannerImg}
									/>
								</React.Fragment>
							))}
					</div>
					{vdb.values.patreonLink && (
						<>
							<hr />
							<PatreonLink />
						</>
					)}
					{/* TODO: PaypalDonateButton */}
				</div>
			</div>
		);
	},
);

export default LeftMenu;
