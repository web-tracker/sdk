import { BrowserType, Environment } from './Detector';
export * from './Detector';

const env = new Environment();
const detected = env.detect();

if (detected.browser.type === BrowserType.Chrome) {

}