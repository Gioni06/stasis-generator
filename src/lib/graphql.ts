import { graphql, buildSchema } from "graphql";

function createSchema(schema: string) {
  return buildSchema(schema);
}

export const makeGraph = (
  schema: string,
  root: { [key: string]: (args: any) => any }
) => {
  const s = createSchema(schema);
  const query = async (q: string) => {
    return graphql(s, q, root);
  };
  return query;
};
