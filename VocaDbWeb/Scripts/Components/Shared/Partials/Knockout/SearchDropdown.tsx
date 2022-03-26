import ButtonGroup from '@Bootstrap/ButtonGroup';
import Dropdown from '@Bootstrap/Dropdown';
import { AlbumSortRule } from '@Stores/Search/AlbumSearchStore';
import { ArtistSortRule } from '@Stores/Search/ArtistSearchStore';
import { EventSortRule } from '@Stores/Search/EventSearchStore';
import { SongSortRule } from '@Stores/Search/SongSearchStore';
import { RatedSongForUserSortRule } from '@Stores/User/RatedSongsSearchStore';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { useTranslation } from 'react-i18next';

// Corresponds to Translate.AlbumSortRuleNames in C#.
const albumSortRules = [
	AlbumSortRule.Name,
	AlbumSortRule.AdditionDate,
	AlbumSortRule.ReleaseDate,
	AlbumSortRule.RatingAverage,
	AlbumSortRule.RatingTotal,
	AlbumSortRule.CollectionCount,
];

interface AlbumSearchDropdownProps {
	albumSearchStore: { sort: AlbumSortRule };
}

export const AlbumSearchDropdown = observer(
	({ albumSearchStore }: AlbumSearchDropdownProps): React.ReactElement => {
		const { t } = useTranslation(['Resources', 'ViewRes']);

		return (
			<div className="inline-block search-sort-menu">
				{t('ViewRes:EntryIndex.SortBy')}{' '}
				<Dropdown as={ButtonGroup}>
					<Dropdown.Toggle>
						<span>
							{t(`Resources:AlbumSortRuleNames.${albumSearchStore.sort}`)}
						</span>{' '}
						<span className="caret" />
					</Dropdown.Toggle>
					<Dropdown.Menu>
						{albumSortRules.map((sortRule) => (
							<Dropdown.Item
								onClick={(): void =>
									runInAction(() => {
										albumSearchStore.sort = sortRule;
									})
								}
								key={sortRule}
							>
								{t(`Resources:AlbumSortRuleNames.${sortRule}`)}
							</Dropdown.Item>
						))}
					</Dropdown.Menu>
				</Dropdown>
			</div>
		);
	},
);

// Corresponds to Translate.ArtistSortRuleNames in C#.
const artistSortRules = [
	ArtistSortRule.Name,
	ArtistSortRule.AdditionDate,
	ArtistSortRule.AdditionDateAsc,
	ArtistSortRule.ReleaseDate,
	ArtistSortRule.SongCount,
	ArtistSortRule.SongRating,
	ArtistSortRule.FollowerCount,
];

interface ArtistSearchDropdownProps {
	artistSearchStore: { sort: ArtistSortRule };
}

export const ArtistSearchDropdown = observer(
	({ artistSearchStore }: ArtistSearchDropdownProps): React.ReactElement => {
		const { t } = useTranslation(['Resources', 'ViewRes']);

		return (
			<div className="inline-block search-sort-menu">
				{t('ViewRes:EntryIndex.SortBy')}{' '}
				<Dropdown as={ButtonGroup}>
					<Dropdown.Toggle>
						<span>
							{t(`Resources:ArtistSortRuleNames.${artistSearchStore.sort}`)}
						</span>{' '}
						<span className="caret" />
					</Dropdown.Toggle>
					<Dropdown.Menu>
						{artistSortRules.map((sortRule) => (
							<Dropdown.Item
								onClick={(): void =>
									runInAction(() => {
										artistSearchStore.sort = sortRule;
									})
								}
								key={sortRule}
							>
								{t(`Resources:ArtistSortRuleNames.${sortRule}`)}
							</Dropdown.Item>
						))}
					</Dropdown.Menu>
				</Dropdown>
			</div>
		);
	},
);

// Corresponds to Translate.EventSortRuleNames in C#.
const eventSortRules = Object.values(EventSortRule).filter(
	(sortRule) => sortRule !== EventSortRule.None,
);

interface EventSearchDropdownProps {
	eventSearchStore: { sort: EventSortRule };
}

export const EventSearchDropdown = observer(
	({ eventSearchStore }: EventSearchDropdownProps): React.ReactElement => {
		const { t } = useTranslation([
			'ViewRes',
			'VocaDb.Web.Resources.Domain.ReleaseEvents',
		]);

		return (
			<div className="inline-block search-sort-menu">
				{t('ViewRes:EntryIndex.SortBy')}{' '}
				<Dropdown as={ButtonGroup}>
					<Dropdown.Toggle>
						<span>
							{t(
								`VocaDb.Web.Resources.Domain.ReleaseEvents:EventSortRuleNames.${eventSearchStore.sort}`,
							)}
						</span>{' '}
						<span className="caret" />
					</Dropdown.Toggle>
					<Dropdown.Menu>
						{eventSortRules.map((sortRule) => (
							<Dropdown.Item
								onClick={(): void =>
									runInAction(() => {
										eventSearchStore.sort = sortRule;
									})
								}
								key={sortRule}
							>
								{t(
									`VocaDb.Web.Resources.Domain.ReleaseEvents:EventSortRuleNames.${sortRule}`,
								)}
							</Dropdown.Item>
						))}
					</Dropdown.Menu>
				</Dropdown>
			</div>
		);
	},
);

// Corresponds to Translate.SongSortRuleNames in C#.
const songSortRules = [
	SongSortRule.Name,
	SongSortRule.AdditionDate,
	SongSortRule.PublishDate,
	SongSortRule.RatingScore,
	SongSortRule.FavoritedTimes,
	SongSortRule.TagUsageCount,
];

interface SongSearchDropdownProps {
	songSearchStore: { sort: SongSortRule };
}

export const SongSearchDropdown = observer(
	({ songSearchStore }: SongSearchDropdownProps): React.ReactElement => {
		const { t } = useTranslation(['Resources', 'ViewRes']);

		return (
			<div className="inline-block search-sort-menu">
				{t('ViewRes:EntryIndex.SortBy')}{' '}
				<Dropdown as={ButtonGroup}>
					<Dropdown.Toggle>
						<span>
							{t(`Resources:SongSortRuleNames.${songSearchStore.sort}`)}
						</span>{' '}
						<span className="caret" />
					</Dropdown.Toggle>
					<Dropdown.Menu>
						{songSortRules.map((sortRule) => (
							<Dropdown.Item
								onClick={(): void =>
									runInAction(() => {
										songSearchStore.sort = sortRule;
									})
								}
								key={sortRule}
							>
								{t(`Resources:SongSortRuleNames.${sortRule}`)}
							</Dropdown.Item>
						))}
					</Dropdown.Menu>
				</Dropdown>
			</div>
		);
	},
);

// Corresponds to Translate.RatedSongForUserSortRuleNames in C#.
const ratedSongForUserSortRules = [
	RatedSongForUserSortRule.Name,
	RatedSongForUserSortRule.AdditionDate,
	RatedSongForUserSortRule.PublishDate,
	RatedSongForUserSortRule.RatingScore,
	RatedSongForUserSortRule.FavoritedTimes,
	RatedSongForUserSortRule.RatingDate,
];

interface RatedSongsSearchDropdownProps {
	ratedSongsStore: { sort: RatedSongForUserSortRule };
}

export const RatedSongsSearchDropdown = observer(
	({ ratedSongsStore }: RatedSongsSearchDropdownProps): React.ReactElement => {
		const { t } = useTranslation(['Resources', 'ViewRes']);

		return (
			<div className="inline-block search-sort-menu">
				{t('ViewRes:EntryIndex.SortBy')}{' '}
				<Dropdown as={ButtonGroup}>
					<Dropdown.Toggle>
						<span>
							{t([
								`Resources:RatedSongForUserSortRuleNames.${ratedSongsStore.sort}`,
								`Resources:SongSortRuleNames.${ratedSongsStore.sort}`,
							])}
						</span>{' '}
						<span className="caret" />
					</Dropdown.Toggle>
					<Dropdown.Menu>
						{ratedSongForUserSortRules.map((sortRule) => (
							<Dropdown.Item
								onClick={(): void =>
									runInAction(() => {
										ratedSongsStore.sort = sortRule;
									})
								}
								key={sortRule}
							>
								{t([
									`Resources:RatedSongForUserSortRuleNames.${sortRule}`,
									`Resources:SongSortRuleNames.${sortRule}`,
								])}
							</Dropdown.Item>
						))}
					</Dropdown.Menu>
				</Dropdown>
			</div>
		);
	},
);
