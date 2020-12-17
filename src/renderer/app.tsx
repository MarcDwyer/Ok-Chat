import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';

import { Main } from './components/MainApp/main';
import { ThemeStore } from './stores/theme_store';

import './app.scss';
import { TwitchStore } from './stores/tc_store';
import { UserInfoStore } from './stores/user_info_store';
import { StreamStore } from './stores/streams_store';

// Create main element
const mainElement = document.createElement('div');
document.body.appendChild(mainElement);

// Render components
const themeStore = new ThemeStore();
const tc = new TwitchStore();
const userInfo = new UserInfoStore();
const streamStore = new StreamStore();

const render = (Component: () => JSX.Element) => {
    ReactDOM.render(
        <AppContainer>
            <Component />
        </AppContainer>,
        mainElement
    );
};

render(() => (
    <Main themeStore={themeStore} tc={tc} userInfo={userInfo} streamStore={streamStore} />
));
