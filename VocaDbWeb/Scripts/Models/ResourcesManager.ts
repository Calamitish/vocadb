import { ResourcesContract } from '@/DataContracts/ResourcesContract';
import { ResourceRepository } from '@/Repositories/ResourceRepository';
import ko, { Observable } from 'knockout';

export class ResourcesManager {
	public constructor(
		private resourcesRepo: ResourceRepository,
		private cultureCode: string,
	) {}

	private setsToLoad = (setNames: string[]): string[] => {
		var missing = setNames.filter(
			(setName) =>
				this.resources[setName as keyof Observable<ResourcesContract>] == null,
		);
		return missing;
	};

	public resources: Observable<ResourcesContract> = ko.observable({});

	public loadResources = (...setNames: string[]): Promise<void> => {
		var setsToLoad = this.setsToLoad(setNames);
		return this.resourcesRepo
			.getList({
				cultureCode: this.cultureCode,
				setNames: setsToLoad,
			})
			.then((resources) => {
				for (const setName of setNames) {
					this.resources()[setName as keyof ResourcesContract] =
						resources[setName as keyof ResourcesContract];
				}
				this.resources.valueHasMutated!();
			});
	};
}

export class ResourceSetFolderActivityEntry {
	public activityFeedEventNames = 'activityEntry_activityFeedEventNames';
}

export class ResourceSetFolderAlbum {
	public albumEditableFieldNames = 'album_albumEditableFieldNames';
}

export class ResourceSetFolderArtist {
	public artistEditableFieldNames = 'artist_artistEditableFieldNames';
}

export class ResourceSetFolderReleaseEvent {
	public releaseEventEditableFieldNames =
		'releaseEvent_releaseEventEditableFieldNames';
}

export class ResourceSetFolderSong {
	public songEditableFieldNames = 'song_songEditableFieldNames';
}

export class ResourceSetFolderSongList {
	public songListEditableFieldNames = 'songList_songListEditableFieldNames';
	public songListFeaturedCategoryNames =
		'songList_songListFeaturedCategoryNames';
}

export class ResourceSetFolderTag {
	public tagEditableFieldNames = 'tag_tagEditableFieldNames';
}

export class ResourceSetNames {
	public static activityEntry = new ResourceSetFolderActivityEntry();
	public static album = new ResourceSetFolderAlbum();
	public static artist = new ResourceSetFolderArtist();
	public static releaseEvent = new ResourceSetFolderReleaseEvent();
	public static song = new ResourceSetFolderSong();
	public static songList = new ResourceSetFolderSongList();
	public static tag = new ResourceSetFolderTag();

	public static artistTypeNames = 'artistTypeNames';
	public static contentLanguageSelectionNames = 'contentLanguageSelectionNames';
	public static discTypeNames = 'discTypeNames';
	public static songTypeNames = 'songTypeNames';
	public static userGroupNames = 'userGroupNames';
}
