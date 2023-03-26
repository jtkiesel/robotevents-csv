import {config} from 'dotenv';

config();

class Config<T> {
  private constructor(
    private readonly name: string,
    private readonly value?: T
  ) {}

  public static string(name: string) {
    return new Config(name, process.env[name]);
  }

  public static number(name: string) {
    const value = process.env[name];
    return new Config(name, value ? parseFloat(value) : undefined);
  }

  public orElse(value: T) {
    return this.value ?? value;
  }

  public orElseThrow() {
    if (this.value === undefined) {
      throw new Error(`Required environment variable not set: ${this.name}`);
    }
    return this.value;
  }
}

export const port = Config.number('PORT').orElse(8080);
export const robotEventsToken =
  Config.string('ROBOT_EVENTS_TOKEN').orElseThrow();
