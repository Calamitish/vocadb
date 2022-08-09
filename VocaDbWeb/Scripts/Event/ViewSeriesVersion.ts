import { ReleaseEventRepository } from '@/Repositories/ReleaseEventRepository';
import { HttpClient } from '@/Shared/HttpClient';
import { UrlMapper } from '@/Shared/UrlMapper';
import { ArchivedEntryViewModel } from '@/ViewModels/ArchivedEntryViewModel';
import $ from 'jquery';
import ko from 'knockout';

export const EventViewSeriesVersion = (model: {
	entry: {
		archivedVersion: {
			version: number;
		};
		releaseEventSeries: {
			id: number;
		};
	};
}): void => {
	$(function () {
		$('#downloadXmlLink').button({
			icons: { primary: 'ui-icon-arrowthickstop-1-s' },
		});
		$('#reportEntryLink').button({ icons: { primary: 'ui-icon-alert' } });
		$('#showLink').button({ icons: { primary: 'ui-icon-unlocked' } });
		$('#hideLink').button({ icons: { primary: 'ui-icon-locked' } });

		const httpClient = new HttpClient();
		var rep = new ReleaseEventRepository(
			httpClient,
			new UrlMapper(vdb.values.baseAddress),
		);
		var viewModel = new ArchivedEntryViewModel(
			model.entry.releaseEventSeries.id,
			model.entry.archivedVersion.version,
			rep,
		);
		ko.applyBindings(viewModel);
	});
};
