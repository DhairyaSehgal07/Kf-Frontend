import { memo } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const SearchBar = memo(function SearchBar({
  searchQuery,
  onSearchChange,
}: SearchBarProps) {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // onSearchChange(e.target.value);
    onSearchChange(e.target.value);
  };

  return (
    <div className="relative w-full">
      <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-600" />
      <Input
        placeholder="Search by receipt number..."
        value={searchQuery}
        onChange={handleSearchChange}
        className="font-custom focus-visible:ring-primary w-full pl-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      />
    </div>
  );
});

export default SearchBar;
