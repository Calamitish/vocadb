import FakeEntryReportRepository from '@/Tests/TestSupport/FakeEntryReportRepository';
import FakeUserRepository from '@/Tests/TestSupport/FakeUserRepository';
import TopBarViewModel from '@/ViewModels/TopBarViewModel';

var entryTypeTranslations: { [x: string]: string };
var entryReportRepo: FakeEntryReportRepository;
var userRepo: FakeUserRepository;

beforeEach(() => {
	entryTypeTranslations = { Album: 'Album!' };
	entryReportRepo = new FakeEntryReportRepository();
	entryReportRepo.entryReportCount = 39;
	userRepo = new FakeUserRepository();
	userRepo.messages = [
		{
			createdFormatted: '2039.3.9',
			highPriority: false,
			id: 39,
			inbox: 'Received',
			read: false,
			receiver: null!,
			subject: 'New message!',
		},
		{
			createdFormatted: '2039.3.9',
			highPriority: false,
			id: 40,
			inbox: 'Received',
			read: false,
			receiver: null!,
			subject: 'Another message',
		},
	];
});

var create = (getNewReportsCount: boolean = false): TopBarViewModel => {
	return new TopBarViewModel(
		vdb.values,
		entryTypeTranslations,
		'Album',
		'',
		0,
		getNewReportsCount,
		entryReportRepo,
		userRepo,
	);
};

test('constructor', () => {
	var result = create();

	expect(result.entryTypeName(), 'entryTypeName').toBe('Album!');
	expect(result.hasNotifications(), 'hasNotifications').toBe(false);
	expect(result.reportCount(), 'reportCount not loaded').toBe(0);
});

test('constructor load report count', () => {
	var result = create(true);
	expect(result.reportCount(), 'reportCount was loaded').toBe(39);
});

test('ensureMessagesLoaded', () => {
	var target = create();

	target.ensureMessagesLoaded();

	expect(target.isLoaded(), 'isLoaded').toBe(true);
	expect(target.unreadMessages(), 'unreadMessages()').toBeTruthy();
	expect(target.unreadMessages().length, 'unreadMessages().length').toBe(2);
	expect(target.unreadMessages()[0].subject).toBe('New message!');
});
