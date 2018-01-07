import { sortRepositories } from './github';
import '../../tests/browserMocks';

describe('sortRepositories', () => {
  it('it should sort repos by counter ', () => {
    global.localStorage.setItem(
      'repositories_with_counter',
      JSON.stringify({
        '1': 100,
        '2': 10,
        '3': 50
      })
    );

    expect(
      sortRepositories([{ id: 4 }, { id: 1 }, { id: 2 }, { id: 3 }])
    ).toEqual([{ id: 1 }, { id: 3 }, { id: 2 }, { id: 4 }]);
  });
});
