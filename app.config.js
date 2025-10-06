const IS_DEV = process.env.APP_VARIANT === 'development';
const IS_PREVIEW = process.env.APP_VARIANT === 'preview';

const getUniqueIdentifier = () => {
    // if (IS_DEV) {
    //     return 'com.nt19990508.ShokuMeter.dev';
    // }

    // if (IS_PREVIEW) {
    //     return 'com.nt19990508.ShokuMeter.preview';
    // }

    return 'com.nt19990508.ShokuMeter';
};

const getAppName = () => {
    // if (IS_DEV) {
    //     return '食メーター (Dev)';
    // }

    // if (IS_PREVIEW) {
    //     return '食メーター (Preview)';
    // }

    return '色メーター';
};


export default ({ config }) => ({
    ...config,
    name: getAppName(),
    ios: {
        ...config.ios,
        bundleIdentifier: getUniqueIdentifier(),
    },
    android: {
        ...config.android,
        package: getUniqueIdentifier(),
    },
});

