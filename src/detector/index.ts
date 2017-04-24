import detector from 'detector';

/**
 * Detector Field.
 */
interface DetectorField {
  name: string;
  version: string;
  fullVersion: string;
}

/**
 * 3rd party detector wrapper.
 */
class Detector {
  constructor(
    public device: DetectorField,
    public os: DetectorField,
    public engine: DetectorField,
    public browser: DetectorField
  ) {}
}

/**
 * Instantiate detector.
 */
const _detector: Detector = new Detector(
  detector.device,
  detector.os,
  detector.engine,
  detector.browser
);

LOG('detector:', JSON.stringify(_detector));

export enum BrowserType {
  MSIE,
  MS_Edge,
  Chrome,
  Safari,
  Firefox,
  Opera
}

export enum OSType {
  Windows,
  MacOS,
  IOS,
  Android,
  ChromeOS,
  Linux,
  WindowsPhone,
  YunOS
}

export enum EngineType {
  EdgeHTML,       // Microsoft Edge
  Trident,        // Microsoft Trident
  Blink,          // Google Blink
  Webkit,         // Apple Webkit
  Gecko,          // Mozilla Gecko
  Presto,         // Opera Presto
  AndroidWebkit,  // Android Webkit
  UC,             // UC rendering Engine
}

export class Browser {
  private _type: string;
  constructor(
    public type: BrowserType,
    public version: string
  ) {
    this._type = BrowserType[type];
  }
}

export class Engine {
  private _type: string;
  constructor(
    public type: EngineType,
    public version: string
  ) {
    this._type = EngineType[type];
  }
}

export class OperatingSystem {
  private _type: string;
  constructor(
    public type: OSType,
    public version: string
  ) {
    this._type = OSType[type];
  }
}

export class Device {
  constructor(
    public type: string,
    public version: string
  ) {}
}

/**
 * Represents for Environment of Brower.
 * It's an singleton instance.
 */
export class Environment {
  public browser: Browser;
  public device: Device;
  public engine: Engine;
  public operatingSystem: OperatingSystem;

  // No way to get these two in Browser
  public IPAddress: string;
  public network: string;

  /**
   * Detects the environment of target browser.
   * Like type, version, network, etc.
   * @return {Environment}
   */
  public detect(): Environment {
    // Detect browser status
    this.detectBrowser();
    this.detectEngine();
    this.detectOperatingSystem();
    this.detectDevice();
    return this;
  }

  /**
   * Detect browser infomation by detector.
   */
  private detectBrowser() {
    let browser: BrowserType = BrowserType.Chrome;
    const version: string = _detector.browser.fullVersion;
    switch (_detector.browser.name) {
      case 'chrome':
        browser = BrowserType.Chrome;
        break;
      case 'firefox':
        browser = BrowserType.Firefox;
        break;
      case 'opera':
        browser = BrowserType.Opera;
        break;
      case 'ie':
        browser = BrowserType.MSIE;
        break;
      case 'edge':
        browser = BrowserType.MS_Edge;
        break;
      default: break;
    }
    this.browser = new Browser(browser, version);
  }

  private detectEngine() {
    let engine: EngineType = EngineType.Webkit;
    const version: string = _detector.engine.fullVersion;
    switch (_detector.engine.name) {
      case 'edgehtml':
        engine = EngineType.EdgeHTML;
        break;
      case 'trident':
        engine = EngineType.Trident;
        break;
      case 'blink':
        engine = EngineType.Blink;
        break;
      case 'webkit':
        engine = EngineType.Webkit;
        break;
      case 'gecko':
        engine = EngineType.Gecko;
        break;
      case 'presto':
        engine = EngineType.Presto;
        break;
      case 'androidwebkit':
        engine = EngineType.AndroidWebkit;
        break;
      case 'u2': case 'u3':
        engine = EngineType.UC;
        break;
      default: break;
    }
    this.engine = new Engine(engine, version);
  }

  private detectOperatingSystem() {
    let operatingSystem: OSType = OSType.MacOS;
    const version: string = _detector.browser.fullVersion;
    switch (_detector.os.name) {
      case 'window':
        operatingSystem = OSType.Windows;
        break;
      case 'macosx':
        operatingSystem = OSType.MacOS;
        break;
      case 'ios':
        operatingSystem = OSType.IOS;
        break;
      case 'android':
        operatingSystem = OSType.Android;
        break;
      case 'chromeos':
        operatingSystem = OSType.ChromeOS;
        break;
      case 'linux':
        operatingSystem = OSType.Linux;
        break;
      case 'wp':
        operatingSystem = OSType.WindowsPhone;
        break;
      case 'yunos':
        operatingSystem = OSType.YunOS;
        break;
      default: break;
    }
    this.operatingSystem = new OperatingSystem(operatingSystem, version);
  }

  private detectDevice() {
    this.device = new Device(_detector.device.name, _detector.device.fullVersion);
  }
}
