import { getSortedRepos } from './github';
import '../../tests/browserMocks';

describe('getSortedRepos', () => {
  it('it should sort repos by counter ', () => {
    global.localStorage.setItem(
      'repositories_with_counter',
      JSON.stringify({
        elasticsearch: 100,
        kibana: 10,
        'x-pack-kibana': 50
      })
    );

    expect(
      getSortedRepos([
        { name: 'beats' },
        { name: 'elasticsearch' },
        { name: 'x-pack-kibana' },
        { name: 'kibana' }
      ])
    ).toEqual([
      { name: 'elasticsearch' },
      { name: 'x-pack-kibana' },
      { name: 'kibana' },
      { name: 'beats' }
    ]);
  });

  it('it should leave unordered repos unchanged', () => {
    global.localStorage.setItem(
      'repositories_with_counter',
      JSON.stringify({ elasticsearch: 1 })
    );

    expect(
      getSortedRepos([
        { name: 'beats' },
        { name: 'elasticsearch' },
        { name: 'x-pack-kibana' },
        { name: 'kibana' }
      ])
    ).toEqual([
      { name: 'elasticsearch' },
      { name: 'beats' },
      { name: 'x-pack-kibana' },
      { name: 'kibana' }
    ]);
  });
});
