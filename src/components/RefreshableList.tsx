import { FlatList, FlatListProps } from "react-native";

type RefreshableListProps<ItemT> = FlatListProps<ItemT> & {
  refreshing: boolean;
  onRefresh: () => void;
};

export default function RefreshableList<ItemT>({
  refreshing,
  onRefresh,
  ...flatListProps
}: RefreshableListProps<ItemT>) {
  return (
    <FlatList
      refreshing={refreshing}
      onRefresh={onRefresh}
      {...flatListProps}
    />
  );
}
