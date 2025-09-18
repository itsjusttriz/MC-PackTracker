import { schedule, type TaskFn } from 'node-cron';

export class CronService {
	private static instance: CronService;

	public static getInstance() {
		if (!CronService.instance) CronService.instance = new CronService();
		return CronService.instance;
	}

	private _processes: ReturnType<TaskFn>[] = [];

	register(expr: string, cb: TaskFn) {
		const task = schedule(expr, cb, {
			timezone: 'Europe/Dublin',
		});

		this._processes.push(task);
	}
}
