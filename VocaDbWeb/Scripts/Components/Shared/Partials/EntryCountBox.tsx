import EntryCount from '@/Components/Shared/Partials/Knockout/EntryCount';
import ServerSidePagingStore from '@/Stores/ServerSidePagingStore';
import { observer } from 'mobx-react-lite';
import React from 'react';

interface EntryCountBoxProps {
	pagingStore: ServerSidePagingStore;
	selections?: number[];
}

const EntryCountBox = observer(
	({
		pagingStore,
		selections = [10, 20, 40, 100],
	}: EntryCountBoxProps): React.ReactElement => {
		return (
			<div className="pull-right">
				<EntryCount pagingStore={pagingStore} selections={selections} />
			</div>
		);
	},
);

export default EntryCountBox;
