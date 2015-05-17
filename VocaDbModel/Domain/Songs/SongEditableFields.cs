﻿using System;

namespace VocaDb.Model.Domain.Songs {

	/// <summary>
	/// Saved in the database as strings - numbers can be changed, but not the names.
	/// </summary>
	[Flags]
	public enum SongEditableFields {

		Nothing			= 0,

		Artists			= 1,

		Length			= 2,

		Lyrics			= 4,

		Names			= 8,

		Notes			= 16,

		OriginalName	= 32,

		OriginalVersion	= 64,

		PublishDate		= 128,

		PVs				= 256,

		SongType		= 512,

		Status			= 1024,

		WebLinks		= 2048

	}

}
