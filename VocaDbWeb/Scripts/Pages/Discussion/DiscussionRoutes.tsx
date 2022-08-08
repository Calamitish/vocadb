import Layout from '@/Components/Shared/Layout';
import LoginManager from '@/Models/LoginManager';
import ErrorNotFound from '@/Pages/Error/ErrorNotFound';
import DiscussionRepository from '@/Repositories/DiscussionRepository';
import HttpClient from '@/Shared/HttpClient';
import UrlMapper from '@/Shared/UrlMapper';
import DiscussionIndexStore from '@/Stores/Discussion/DiscussionIndexStore';
import React from 'react';
import { Route, Routes } from 'react-router-dom';

import '../../../wwwroot/Content/Styles/discussions.less';

const DiscussionFolders = React.lazy(() => import('./DiscussionFolders'));
const DiscussionIndex = React.lazy(() => import('./DiscussionIndex'));
const DiscussionTopics = React.lazy(() => import('./DiscussionTopics'));

interface DiscussionLayoutProps {
	children?: React.ReactNode;
	title?: string;
}

export const DiscussionLayout = ({
	children,
	title,
}: DiscussionLayoutProps): React.ReactElement => {
	return <Layout title={title}>{children}</Layout>;
};

const loginManager = new LoginManager(vdb.values);

const httpClient = new HttpClient();
const urlMapper = new UrlMapper(vdb.values.baseAddress);
const discussionRepo = new DiscussionRepository(httpClient, urlMapper);

const discussionIndexStore = new DiscussionIndexStore(
	loginManager,
	discussionRepo,
	loginManager.canDeleteComments,
);

const DiscussionRoutes = (): React.ReactElement => {
	return (
		<Routes>
			<Route
				path=""
				element={
					<DiscussionIndex discussionIndexStore={discussionIndexStore} />
				}
			/>
			<Route
				path="folders/:folderId"
				element={
					<DiscussionFolders discussionIndexStore={discussionIndexStore} />
				}
			/>
			<Route
				path="topics/:topicId"
				element={
					<DiscussionTopics discussionIndexStore={discussionIndexStore} />
				}
			/>
			<Route path="*" element={<ErrorNotFound />} />
		</Routes>
	);
};

export default DiscussionRoutes;
