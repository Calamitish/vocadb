import ArtistRepository from '@/Repositories/ArtistRepository';
import ui from '@/Shared/MessagesTyped';
import ReportEntryViewModel from '@/ViewModels/ReportEntryViewModel';

export default class ArchivedArtistViewModel {
	public constructor(
		artistId: number,
		versionNumber: number,
		private repository: ArtistRepository,
	) {
		this.reportViewModel = new ReportEntryViewModel(
			null!,
			(reportType, notes) => {
				repository.createReport({
					artistId: artistId,
					reportType: reportType,
					notes: notes,
					versionNumber: versionNumber,
				});

				ui.showSuccessMessage(vdb.resources.shared.reportSent);
			},
			{ notesRequired: true, id: 'Other', name: null! },
		);
	}

	public reportViewModel: ReportEntryViewModel;
}
