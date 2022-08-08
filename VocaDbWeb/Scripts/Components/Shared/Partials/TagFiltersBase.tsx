import Button from '@Bootstrap/Button';
import EntryUrlMapper from '@Shared/EntryUrlMapper';
import TagFiltersStore from '@Stores/Search/TagFilters';
import { observer } from 'mobx-react-lite';
import React from 'react';
import { Link } from 'react-router-dom';

interface TagFiltersBaseProps {
	tagFilters: TagFiltersStore;
}

const TagFiltersBase = observer(
	({ tagFilters }: TagFiltersBaseProps): React.ReactElement => {
		return (
			<>
				{tagFilters.tags.map((tag, index) => (
					<div className="control-group" key={index}>
						<div
							style={{ display: 'inline-block' }}
							className="input-append input-prepend"
						>
							<Button
								as={Link}
								className="btn-nomargin"
								to={EntryUrlMapper.details_tag(tag.id, tag.urlSlug)}
							>
								<i className="icon icon-info-sign" />
							</Button>
							<div className="input-append">
								<input
									type="text"
									className="input-large"
									readOnly
									value={tag.name ?? ''}
								/>
								<Button
									variant="danger"
									onClick={(): void => tagFilters.removeTag(tag)}
								>
									Clear{/* TODO: localize */}
								</Button>
							</div>
						</div>
					</div>
				))}
			</>
		);
	},
);

export default TagFiltersBase;
