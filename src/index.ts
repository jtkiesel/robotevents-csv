import {RobotEventsClient} from '@robotevents/client';
import express from 'express';
import {port} from './config';

const app = express();
const robotEventsClient = new RobotEventsClient();

app.get('/:sku/teams', async (request, response) => {
  const {sku} = request.params;
  const events = robotEventsClient.events.findAll(e => e.skus(sku));
  if (!(await events.hasNext())) {
    return response.sendStatus(404);
  }

  const event = await events.next();
  const teams = await robotEventsClient.teams
    .findAllByEvent(t => t.eventId(event.id))
    .map(
      ({
        number,
        team_name,
        grade,
        organization,
        location: {city, region, country},
      }) =>
        [number, team_name, grade, organization, city, region, country]
          .map(value => (value === null ? '' : value))
          .map(value => escape(value))
          .join()
    )
    .toArray();

  return response.type('csv').send(teams.join('\n'));
});

app.listen(port, () => console.info(`Listening on port ${port}`));

const escape = (text: string) => {
  const escaped = text.replaceAll('"', '""');
  return escaped.includes(',') ? `"${escaped}"` : escaped;
};
