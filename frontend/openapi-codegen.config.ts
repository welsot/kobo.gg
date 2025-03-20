import { generateSchemaTypes, generateFetchers } from '@openapi-codegen/typescript';
import { defineConfig } from '@openapi-codegen/cli';
export default defineConfig({
  api: {
    from: {
      source: 'url',
      url: 'http://localhost:8080/openapi/v1.json',
    },
    outputDir: 'app/api',
    to: async (context) => {
      const filenamePrefix = 'api';
      const { schemasFiles } = await generateSchemaTypes(context, {
        filenamePrefix,
      });
      await generateFetchers(context, {
        filenamePrefix,
        schemasFiles,
      });
    },
  },
});
