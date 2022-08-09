import { LoginManager } from '@/Models/LoginManager';
import { RepositoryFactory } from '@/Repositories/RepositoryFactory';
import { functions } from '@/Shared/GlobalFunctions';
import { HttpClient } from '@/Shared/HttpClient';
import { ui } from '@/Shared/MessagesTyped';
import { UrlMapper } from '@/Shared/UrlMapper';
import { IEntryReportType } from '@/ViewModels/ReportEntryViewModel';
import {
	SongDetailsAjax,
	SongDetailsResources,
	SongDetailsViewModel,
} from '@/ViewModels/Song/SongDetailsViewModel';
import $ from 'jquery';
import ko from 'knockout';
import moment from 'moment';

function initPage(
	jsonModel: SongDetailsAjax,
	songId: number,
	saveStr: string,
	urlMapper: UrlMapper,
	viewModel: SongDetailsViewModel,
): void {
	function initMediaPlayer(): void {
		$('audio').mediaelementplayer({
			pluginPath: 'https://cdnjs.com/libraries/mediaelement/',
		});
	}

	$('.js-ratingButtons').buttonset();
	$('#reportEntryLink').button({ icons: { primary: 'ui-icon-alert' } });
	$('#manageTags').button({ icons: { primary: 'ui-icon-wrench' } });
	$('#viewVersions').button({ icons: { primary: 'ui-icon-clock' } });
	$('#viewCommentsLink').click(function () {
		var index = $('#tabs ul [data-tab="Discussion"]').index();
		$('#tabs').tabs('option', 'active', index);
		return false;
	});
	$('#viewRelatedLink').click(function () {
		var index = $('#tabs ul [data-tab="Related"]').index();
		$('#tabs').tabs('option', 'active', index);
		return false;
	});

	$('#tabs').tabs({
		load: function (event, ui) {
			functions.disableTabReload(ui.tab);
		},
		activate: function (event, ui) {
			if (ui.newTab.data('tab') === 'Discussion') {
				viewModel.comments.initComments();
			}
		},
	});

	$('#pvLoader')
		.ajaxStart(function (this: any) {
			$(this).show();
		})
		.ajaxStop(function (this: any) {
			$(this).hide();
		});

	$('.pvLink:not(.disabled)').click(function (this: any) {
		var id = functions.getId(this);
		$.post(
			urlMapper.mapRelative('/Song/PVForSong'),
			{ pvId: id },
			function (content) {
				$('#pvPlayer').html(content);
				initMediaPlayer();
			},
		);

		return false;
	});

	$('td.artistList a').vdbArtistToolTip();
	$('#albumList a').vdbAlbumWithCoverToolTip();
	initMediaPlayer();
}

export const SongDetails = (
	model: {
		id: number;
		jsonModel: SongDetailsAjax;
	},
	reportTypes: IEntryReportType[],
	resources: SongDetailsResources,
	saveStr: string,
	showTranslatedDescription: boolean,
): void => {
	$(document).ready(function () {
		const loginManager = new LoginManager(vdb.values);
		const canDeleteAllComments = loginManager.canDeleteComments;

		moment.locale(vdb.values.culture);

		vdb.resources.song = resources;

		var jsonModel = model.jsonModel;
		const httpClient = new HttpClient();
		var rootPath = vdb.values.baseAddress;
		var urlMapper = new UrlMapper(rootPath);
		var repoFactory = new RepositoryFactory(httpClient, urlMapper);
		var repo = repoFactory.songRepository();
		var userRepo = repoFactory.userRepository();
		var artistRepo = repoFactory.artistRepository();

		var viewModel = new SongDetailsViewModel(
			vdb.values,
			httpClient,
			repo,
			userRepo,
			artistRepo,
			resources,
			showTranslatedDescription,
			jsonModel,
			reportTypes,
			canDeleteAllComments,
			ui.showThankYouForRatingMessage,
		);
		ko.applyBindings(viewModel);

		viewModel.songListDialog.addedToList = function (): void {
			ui.showSuccessMessage(resources.addedToList);
		};

		initPage(jsonModel, model.id, saveStr, urlMapper, viewModel);
	});
};
