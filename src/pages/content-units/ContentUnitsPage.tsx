import {
  useCreateContentUnitMutation,
  useDeleteContentUnitMutation,
  useGetContentUnitsQuery,
  useUpdateContentUnitMutation,
} from '../../features/catalog-units/api'
import { CatalogUnitsWorkspace } from '../../features/catalog-units/components/CatalogUnitsWorkspace'

export function ContentUnitsPage() {
  return (
    <CatalogUnitsWorkspace
      title="Content units"
      description="What is inside one pack: tablets, ml, grams, or any unit you add later."
      createLabel="Create content unit"
      entityLabel="Content unit"
      singularHint="Used in labels such as 1 tablet or 100 ml."
      pluralHint="Used in labels such as 10 tablets."
      useListQuery={useGetContentUnitsQuery}
      useCreateMutation={useCreateContentUnitMutation}
      useUpdateMutation={useUpdateContentUnitMutation}
      useDeleteMutation={useDeleteContentUnitMutation}
    />
  )
}
