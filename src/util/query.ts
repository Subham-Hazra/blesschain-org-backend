export type Filters<T> = Partial<T>;
export type Query = Record<string, any>;

export class QueryBuilder<T extends Record<string, any>> {
  private filters: Filters<T>;
  private query: Query;
  private REGEX_MATCH_KEYS: string[];

  constructor(filters: Filters<T>, query: Query, REGEX_MATCH_KEYS: string[]) {
    this.filters = filters;
    this.query = query;
    this.REGEX_MATCH_KEYS = REGEX_MATCH_KEYS;
  }

  public setSearchParams(search: string,  params: string[]): Query {
    console.log('setSearchParams called with search:', search, 'and params:', params);
    if(!search) return {
      build : () => this.build()
    }

    console.log(params, 'params');
    let $exprQ = this.query['$expr'] ?? {};
    const $orQ: any[] = $exprQ?.$or ?? [];
    params.forEach((key) => {
      $orQ.push({
        $regexMatch: {
          input: `$${key}`,
          regex: new RegExp(search, 'i'), // 'i' for case-insensitive match
        },
      });
    });

    if ($orQ.length) {
      $exprQ = {
        ...$exprQ,
        $and: [{
          $or : $orQ
        }],
      };
    }

    if (!Object.keys($exprQ).length) return this.query;
    console.log( $exprQ, ' $exprQ');

    this.query['$expr'] = $exprQ;
    return {
      build : () => this.build()
    }
  }

  public build(): Query {
    console.log('this.query[$expr]', this.query);
    let $exprQ = this.query['$expr'] ?? {};
    const $andQ: any[] = $exprQ?.$and ?? [];
    console.log("$andQ : ", $andQ);
    Object.entries(this.filters).forEach(([key, value]) => {
      const $orQ: any[] = [];
      if (value && Array.isArray(value)) {
        if (!value.length) return;

        $andQ.push({
          $in: [`$${key}`, value],
        });
      } else if (this.REGEX_MATCH_KEYS.includes(key) && value) {
        $andQ.push({
          $regexMatch: {
            input: `$${key}`,
            regex: new RegExp(value, 'i'), // 'i' for case-insensitive match
          },
        });
      } else if (value || typeof(value) === 'boolean') {
        // ? if the value is not an array,
        $andQ.push(this.genQuery(key, value));
      } 
    });

    if ($andQ.length) {
      $exprQ = {
        ...$exprQ,
        $and: $andQ,
      };
    }

    if (!Object.keys($exprQ).length) return this.query;

    this.query['$expr'] = $exprQ;

    return this.query;
  }

  private genQuery(key: string, value: string) {
    const mongoKey = `$${key}`;

    return {
      $eq: [mongoKey, value],
    };
  }
}
