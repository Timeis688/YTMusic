pnpm run outdir

rm -rf server/dist
mkdir server/dist
touch server/dist/index.html

cd server
go run . --dev &
cd ..

pnpm run generate
pnpm run dev

echo "Done building!"