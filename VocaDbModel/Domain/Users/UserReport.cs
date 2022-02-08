namespace VocaDb.Model.Domain.Users
{
	public enum UserReportType
	{
		/// <summary>
		/// Found a match on StopForumSpam, identifying the user as malicious.
		/// </summary>
		MaliciousIP = 1 << 0,

		/// <summary>
		/// Other users reported for spamming.
		/// </summary>
		Spamming = 1 << 1,

		/// <summary>
		/// User's editing permissions were removed by a staff member.
		/// </summary>
		RemovePermissions = 1 << 2,

		Other = 1 << 3,
	}

	public class UserReport : GenericEntryReport<User, UserReportType>
	{
		public UserReport() { }

		public UserReport(User reportedUser, UserReportType reportType, User user, string hostname, string notes)
			: base(reportedUser, reportType, user, hostname, notes, null) { }
	}
}
